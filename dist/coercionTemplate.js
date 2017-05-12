"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
exports.baseTemplate = () => `import * as joi from "joi";
import * as t from "../types.d";
import * as s from ".";

const defaultOptions: joi.ValidationOptions = {
  convert: true,
  allowUnknown: true,
  stripUnknown: true,
  presence: "optional",
};

export function coerceValue<T>(schema: joi.Schema) {
  return function(object: any, options?: any): T {
    const resolvedOptions = Object.assign({}, defaultOptions, options);
    let coerced: T;
    joi.validate(object, schema, resolvedOptions, (err, result) => {
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
const coerceFactory = (name) => `  build: coerceFactory<t.${name}>(s.${name}Factory, s.${name}Schema),`;
exports.default = (name, hasFactory) => lodash_1.compact([
    `export const ${name}Utils = {`,
    hasFactory ? coerceFactory(name) : null,
    `  coerce: coerceValue<t.${name}>(s.${name}Schema),`,
    "};",
]).join("\n");
