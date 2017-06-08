import fs = require("fs");
import { compact, flatMap, flatten, isString, sortBy, uniq } from "lodash";
import * as path from "path";
import { Config } from "../config";
import { isArray, isBasic, isInterface } from "../schemaVisitor/predicates";
import { Field, InterfaceType, VisitedType } from "../schemaVisitor/types";
import { headers } from "./shared";
import { arrayToFieldType, basicToFieldType } from "./types";

const fieldTypeToString = (field: Field) => {
  if (isString(field.type.name)) {
    return field.type.name;
  }

  if (isArray(field.type.class)) {
    return arrayToFieldType(field.type.class);
  }

  if (isBasic(field.type.class)) {
    return basicToFieldType(field.type.class);
  }

  return "unknown";
};

// tslint:disable-next-line:max-line-length
const mandatoryLens = (name: string, fromType: string, toType: string) => `export const ${name}Lens: Lens<${fromType}, ${toType}> = Lens
  .fromProp<${fromType}, "${name}">("${name}");
`;

// tslint:disable-next-line:max-line-length
const optionalLens = (name: string, fromType: string, toType: string) => `export const ${name}OptionalLens: Lens<${fromType}, Option<${toType}>> = Lens
  .fromProp<${fromType}, "${name}">("${name}");

export const ${name}Lens: Optional<${fromType}, ${toType}> = ${name}OptionalLens
  .composePrism(Prism.some<${toType}>());
`;

const lensBuilder = ({ required }: Field) => required ? mandatoryLens : optionalLens;

const importsToString = (source: string, symbols: string[]): string[] =>
  symbols.length === 0 ? [] : [`import { ${symbols.sort().join(", ")} } from "${source}";`];

const relativePath = (from: string, to: string) => {
  const p = path.relative(path.dirname(from), to).replace(/\.ts$/, "");
  return p.charAt(0) === "." ? p : `./${p}`;
};

const interfaceToImports = (typesPath: string, type: VisitedType): string[] => {
  const monocle: string[] = ["Lens"];
  const option: string[] = [];
  const types: string[] = [type.name];

  const iface = type.class as InterfaceType;
  const hasOptional = iface.fields.find(field => !field.required);

  if (hasOptional) {
    monocle.push("Optional", "Prism");
    option.push("Option");
  }

  const uniqueFieldTypes = uniq(flatMap(iface.fields, field => {
    if (isString(field.type.name)) {
      return [field.type.name];
    }

    if (isArray(field.type.class)) {
      return field.type.class.elements;
    }

    return [];
  })).sort();

  types.push(...uniqueFieldTypes);

  const monocleImports = importsToString("monocle-ts", monocle);
  const optionImports = importsToString("fp-ts/lib/Option", option);
  const typeImports = importsToString(typesPath, types);

  return monocleImports.concat(optionImports).concat(typeImports);
};

const interfaceToString = (type: VisitedType): string[] => {
  const iface = type.class as InterfaceType;

  return sortBy(iface.fields, field => field.key)
    .map(field => lensBuilder(field)(field.key, type.name, fieldTypeToString(field)));
};

const writeOpticsForInterface = (config: Config) => (type: VisitedType): void => {
  const fileName = type.name.charAt(0).toLowerCase() + type.name.substr(1);
  const filePath = path.join(config.paths.optics, `${fileName}Lenses.generated.ts`);
  const relativePathToTypes = relativePath(filePath, config.paths.types);

  const content = headers()
    .concat([""])
    .concat(interfaceToImports(relativePathToTypes, type))
    .concat([""])
    .concat(interfaceToString(type))
    .join(`\n`);

  fs.writeFileSync(filePath, content);
};

export const writeOpticsContent = (config: Config, types: VisitedType[]): void => {
  return types.filter(type => isInterface(type.class))
    .forEach(writeOpticsForInterface(config));
};
