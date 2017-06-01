// tslint:disable:max-line-length
import { compact } from "lodash";

// string constants

const cloneToPlainObject = `export const cloneToPlainObject = (obj: any) => unwrapOptions(cloneDeep(obj));`;

const coerceFactory = `export function coerceFactory<T>(factory: Factory.IFactory, schema: joi.Schema) {
  return (attrs?: any, options?: any): T =>
    coerceValue<T>(schema)(factory.build(attrs, options));
}`;

const defaultOptions = `const defaultOptions: joi.ValidationOptions = {
  allowUnknown: true,
  convert: true,
  presence: "optional",
  stripUnknown: true,
};`;

const isValueless = `export const isValueless = (obj: any) => (obj === undefined) || (obj === null);`;

const mapOptionalFieldsToOptions = `export function mapOptionalFieldsToOptions<T>(schema: joi.Schema) {
  return (obj: any): T => wrapOptions(schema, obj);
}`;

const optionTypeImports = [
  `import * as option from "fp-ts/lib/Option";`,
  `import { cloneDeep, forOwn, get, isArray, isPlainObject } from "lodash";`,
];

const tslintRules = `// tslint:disable:ordered-imports max-line-length`;

const unwrapOptions = `const unwrapOptions = (thing: any) => {
  if (isValueless(thing)) {
    return thing;
  }

  const className = thing.constructor.name;

  if (className === "None") {
    return undefined;
  }

  if (className === "Some") {
    return thing.toNullable();
  }

  if (isPlainObject(thing)) {
    forOwn(thing, (v, k) => thing[k] = unwrapOptions(v));

    return thing;
  }

  if (isArray(thing)) {
    return thing.map(unwrapOptions);
  }

  return thing;
};`;

const wrapOption = `const wrapOption = (val: any) => {
  if (isValueless(val)) {
    return option.none;
  }

  if (option.isNone(val) || option.isSome(val)) {
    return val;
  }

  return option.some(val);
};`;

const wrapOptions = `const wrapOptions = (schema: joi.Schema, obj: any): any => {
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
      ? wrapOptions(field.schema, value)
      : value;

    const maybeValue = required
      ? recursedValue
      : wrapOption(recursedValue);

    return { ...prev, [field.key]: maybeValue };
  }, obj);
};`;

// array constants

const defaultImports = [
  `import * as freeze from "deep-freeze-strict";`,
  `import * as joi from "joi";`,
];

const optionTypeFns = [
  cloneToPlainObject,
  isValueless,
  mapOptionalFieldsToOptions,
  unwrapOptions,
  wrapOption,
  wrapOptions,
];

// functions

const buildCommand = (name: string) => `  build: coerceFactory<t.${name}>(s.${name}Factory, s.${name}Schema),`;

const coerceCommand = (name: string) => `  coerce: coerceValue<t.${name}>(s.${name}Schema),`;

const coerceValue = (optionTypes: boolean) => `export function coerceValue<T>(schema: joi.Schema) {
  return (object: any, options?: any): T => {
    const resolvedOptions = Object.assign({}, defaultOptions, options);
    let coerced: any;

    joi.validate(${optionTypes ? "cloneToPlainObject(object)" : "object"}, schema, resolvedOptions, (err, result) => {
      if (err) { throw err; }
      coerced = result;
    });

    return freeze(${optionTypes ? "wrapOptions(schema, coerced)" : "coerced"}) as T;
  };
}`;

const imports = (optionTypes: boolean, schemasPath: string, typesPath: string) => {
  const dynamicImports = [
    `import * as s from "${schemasPath}";`,
    `import * as t from "${typesPath}";`,
  ];

  return defaultImports
    .concat(optionTypes ? optionTypeImports : [])
    .concat(dynamicImports)
    .join(`\n`);
};

// exports

export const baseTemplate = (optionTypes: boolean, schemasPath: string, typesPath: string) => compact([
  tslintRules,
  imports(optionTypes, schemasPath, typesPath),
  defaultOptions,
  optionTypes ? optionTypeFns.join("\n\n") : null,
  coerceValue(optionTypes),
  coerceFactory,
]).join(`\n\n`);

export default (name: string, hasFactory: boolean) =>
  compact([
    `export const ${name}Utils = {`,
    hasFactory ? buildCommand(name) : null,
    coerceCommand(name),
    "};",
  ]).join("\n");
