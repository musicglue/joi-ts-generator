"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
exports.baseTemplate = () => `import * as joi from "joi";
import * as t from "../types.d";
import * as s from ".";

function coerceValue<T>(schema: joi.Schema) {
  return function(object: any, options?: any): T {
    let coerced: T;
    joi.validate(object, schema, options, (err, result) => {
      if (err) { throw err; }
      coerced = result;
    });
    return coerced;
  }
}

function coerceFactory<T>(factory: Factory.IFactory, schema: joi.Schema) {
  return (attrs?: any, options?: any): T =>
    coerceValue<T>(schema)(factory.build(attrs, options));
}`;
const coerceFactory = (name) => `  build: coerceFactory<t.${name}>(s.${name}Factory, s.${name}Schema),`;
exports.default = (name, hasFactory) => lodash_1.compact([
    `export const ${name} = {`,
    hasFactory ? coerceFactory(name) : null,
    `  coerce: coerceValue<t.${name}>(s.${name}Schema),`,
    "};",
]).join("\n");
