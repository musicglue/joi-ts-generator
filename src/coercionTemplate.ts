import { compact } from "lodash";

export const baseTemplate = () =>
`import * as joi from "joi";
import * as t from "../types.d";
import * as s from ".";

export function coerceValue<T>(schema: joi.Schema) {
  return function(object: any, options?: any): T {
    let coerced: T;
    joi.validate(object, schema, options, (err, result) => {
      if (err) { throw err; }
      coerced = result;
    });
    return coerced;
  }
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
