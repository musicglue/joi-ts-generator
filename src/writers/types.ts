import { groupBy, keys, toPairs } from "lodash";
import * as path from "path";
import { Config } from "../config";
import {
  isArray,
  isBasic,
  isInterface,
  isStringUnion,
} from "../schemaVisitor/predicates";
import {
  BasicType,
  Field,
  InterfaceType,
  StringUnionType,
  VisitedType,
} from "../schemaVisitor/types";
import { headers } from "./shared";

const basicToFieldType = (type: BasicType): string =>
  type.type === "date" ? "Date" : type.type;

const basicToString = (type: VisitedType): string => {
  return `export type ${type.name} = ${basicToFieldType(type.class as BasicType)};
`;
};

const fieldToString = (field: Field): string => {
  if (isArray(field.type.class)) {
    const { elements } = field.type.class;

    return elements.length > 1
      ? `Array<${elements.join(" | ")}>`
      : `${elements[0]}[]`;
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

const typeToString = (config: Config) => (type: VisitedType): string => {
  if (isBasic(type.class)) {
    return basicToString(type);
  }

  if (isInterface(type.class)) {
    return interfaceToString(config, type);
  }

  if (isStringUnion(type.class)) {
    return stringUnionToString(type);
  }

  return `// Unknown type: ${type.name} (${type.class})}`;
};

const relativeImportPath = (from: string, to: string) => {
  const p = path.relative(path.dirname(from), to).replace(/\.ts$/, "");
  return p.charAt(0) === "." ? p : `./${p}`;
};

export const buildTypeContent = (config: Config, types: VisitedType[]) => {
  const lines = headers();

  if (config.nullableMode === "option") {
    lines.push("");
    lines.push(`import { Option } from "fp-ts/lib/Option";`);
  }

  const sources = groupBy(toPairs(config.typeImports), ([_, source]) => source);

  keys(sources).forEach(source => {
    const importedTypes = sources[source].map(([ type ]) => type).sort().join(", ");

    lines.push(`import { ${importedTypes} } from "${source}";`);
  });

  lines.push("");

  return lines.concat(types.map(typeToString(config))).join(`\n`);
};
