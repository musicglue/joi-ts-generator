
import { compact } from "lodash";

export const baseTemplate = (schemasPath: string, typesPath: string) =>
`// tslint:disable:ordered-imports max-line-length
import * as joi from "joi";

import * as s from "${schemasPath}";
import * as t from "${typesPath}";

const defaultOptions: joi.ValidationOptions = {
  allowUnknown: true,
  convert: true,
  presence: "optional",
  stripUnknown: true,
};

export function coerceValue<T>(schema: joi.Schema) {
  return (object: any, options?: any): T => {
    const resolvedOptions = Object.assign({}, defaultOptions, options);
    let coerced: T;
    joi.validate(object, schema, resolvedOptions, (err, result) => {
      if (err) { throw err; }
      coerced = result;
    });
    return coerced;
  };
}

export function coerceFactory<T>(factory: Factory.IFactory, schema: joi.Schema) {
  return (attrs?: any, options?: any): T =>
    coerceValue<T>(schema)(factory.build(attrs, options));
}`;

const coerceFactory = (name: string) =>
  `  build: coerceFactory<t.${name}>(s.${name}Factory, s.${name}Schema),`;

export default (name: string, hasFactory: boolean) =>
  compact([
    `export const ${name}Utils = {`,
    hasFactory ? coerceFactory(name) : null,
    `  coerce: coerceValue<t.${name}>(s.${name}Schema),`,
    "};",
  ]).join("\n");
