// tslint:disable:max-line-length
import { compact } from "lodash";

const imports = (optionTypes: boolean, schemasPath: string, typesPath: string) =>
`${optionTypes ? "import * as option from \"fp-ts/lib/Option\";" : ""}
import * as joi from "joi";
${optionTypes ? "import { get } from \"lodash\";" : ""}
import * as s from "${schemasPath}";
import * as t from "${typesPath}";`;

const optionTypeFunctions = () => `const isValueless = (obj: any) => (obj === undefined) || (obj === null);

const wrapInOption = (val: any) => {
  if (isValueless(val)) {
    return option.none;
  }

  if (option.isNone(val) || option.isSome(val)) {
    return val;
  }

  return option.some(val);
};

const wrapOptionalField = (schema: joi.Schema, obj: any): any => {
  if (isValueless(obj)) {
    return obj;
  }

  const fields = (schema as any)._inner.children as any[];

  return fields.reduce((prev, field) => {
    const value = prev[field.key];
    const presence = field.schema._flags.presence;
    const required = presence === "required";
    const nested = (get(field, "schema._inner.children", []) || []).length > 0;

    const recursedValue = nested
      ? wrapOptionalField(field.schema, value)
      : value;

    const maybeValue = required
      ? recursedValue
      : wrapInOption(recursedValue);

    return { ...prev, [field.key]: maybeValue };
  }, obj);
};

export function convertOptionalFieldsToOptionTypes<T>(schema: joi.Schema) {
  return (obj: any): T => wrapOptionalField(schema, obj);
}`;

export const baseTemplate = (optionTypes: boolean, schemasPath: string, typesPath: string) =>
`// tslint:disable:ordered-imports max-line-length
${imports(optionTypes, schemasPath, typesPath)}

const defaultOptions: joi.ValidationOptions = {
  allowUnknown: true,
  convert: true,
  presence: "optional",
  stripUnknown: true,
};

export function coerceValue<T>(schema: joi.Schema) {
  ${optionTypes ? "const withOptionalTypes = convertOptionalFieldsToOptionTypes<T>(schema);\n  " : ""}return (object: any, options?: any): T => {
    const resolvedOptions = Object.assign({}, defaultOptions, options);
    let coerced: T;
    joi.validate(object, schema, resolvedOptions, (err, result) => {
      if (err) { throw err; }
      coerced = result;
    });
    return ${optionTypes ? "withOptionalTypes(coerced)" : "coerced"};
  };
}

export function coerceFactory<T>(factory: Factory.IFactory, schema: joi.Schema) {
  return (attrs?: any, options?: any): T =>
    coerceValue<T>(schema)(factory.build(attrs, options));
}

${optionTypes ? optionTypeFunctions() : ""}`;

const coerceFactory = (name: string) =>
  `  build: coerceFactory<t.${name}>(s.${name}Factory, s.${name}Schema),`;

export default (name: string, hasFactory: boolean) =>
  compact([
    `export const ${name}Utils = {`,
    hasFactory ? coerceFactory(name) : null,
    `  coerce: coerceValue<t.${name}>(s.${name}Schema),`,
    "};",
  ]).join("\n");
