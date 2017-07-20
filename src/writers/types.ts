import { groupBy, keys, toPairs } from "lodash";
import * as path from "path";
import { Config } from "../config";
import {
  hasOptionalField,
  isArray,
  isBasic,
  isInterface,
  isStringUnion,
  isUnion,
} from "../schemaVisitor/predicates";
import {
  ArrayType,
  BasicType,
  Field,
  InterfaceType,
  StringUnionType,
  VisitedType,
  UnionType,
} from "../schemaVisitor/types";
import { headers } from "./shared";

export const arrayToFieldType = (type: ArrayType): string => {
  const { elements } = type;

  return elements.length > 1
    ? `Array<${elements.join(" | ")}>`
    : `${elements[0]}[]`;
};

export const arrayToString = (type: VisitedType): string => {
  return `export type ${type.name} = ${(type.class as ArrayType).elements[0]}[];
`;
};

export const basicToFieldType = (type: BasicType): string =>
  type.type === "date" ? "Date" : type.type;

const basicToString = (type: VisitedType): string => {
  return `export type ${type.name} = ${basicToFieldType(type.class as BasicType)};
`;
};

const fieldToString = (field: Field): string => {
  if (isArray(field.type.class)) {
    return arrayToFieldType(field.type.class);
  }

  if (field.type.name) {
    return field.type.name;
  }

  if (isBasic(field.type.class)) {
    return basicToFieldType(field.type.class);
  }

  return field.type.name;
};

const interfaceToString = (config: Config, type: VisitedType): string => {
  const iface = type.class as InterfaceType;
  const fields = iface.fields
    .map(field => {
      const key = config.nullableMode === "option" || field.required
        ? field.key
        : `${field.key}?`;
      const fieldType = fieldToString(field);
      const maybeFieldType = config.nullableMode === "option" && !field.required
        ? `Option<${fieldType}>`
        : fieldType;

      return `  ${key}: ${maybeFieldType};`;
    })
    .join(`\n`);

  return `export interface ${type.name} {
${fields}
}
`;
};

const stringUnionToString = (type: VisitedType): string => {
  const union = type.class as StringUnionType;
  const alternatives = union.alternatives.map(alt => `  | "${alt}"`).join(`\n`);

  return `export type ${type.name} =
${alternatives};
`;
};

const unionToString = (type: VisitedType): string => {
  const union = type.class as UnionType;
  const alternatives = union.alternatives.map(alt => `  | "${alt}"`).join(`\n`);

  return `export type ${type.name} =
${alternatives};
`;
};

const typeToString = (config: Config) => (type: VisitedType): string => {
  if (isArray(type.class)) {
    return arrayToString(type);
  }

  if (isBasic(type.class)) {
    return basicToString(type);
  }

  if (isInterface(type.class)) {
    return interfaceToString(config, type);
  }

  if (isStringUnion(type.class)) {
    return stringUnionToString(type);
  }

  if (isUnion(type.class)) {
    return unionToString(type);
  }

  return `// Unknown type: ${type.name} (${type.class})}`;
};

const relativeImportPath = (from: string, to: string) => {
  const p = path.relative(path.dirname(from), to).replace(/\.ts$/, "");
  return p.charAt(0) === "." ? p : `./${p}`;
};

export const buildTypeContent = (config: Config, types: VisitedType[]) => {
  const lines = headers();

  if (config.nullableMode === "option" && types.some(hasOptionalField)) {
    lines.push("");
    lines.push(`import { Option } from "fp-ts/lib/Option";`);
  }

  const sources = groupBy(toPairs(config.typeImports), ([_, source]) => source);
  const importExports: string[] = [];

  keys(sources).forEach(source => {
    const importedTypes = sources[source].map(([ type ]) => type).sort().join(", ");

    lines.push(`import { ${importedTypes} } from "${source}";`);
    importExports.push(`export { ${importedTypes} };`);
  });

  if (importExports.length > 0) {
    importExports.push("");
  }

  return lines
    .concat([""])
    .concat(types.map(typeToString(config)))
    .concat(importExports)
    .join(`\n`);
};
