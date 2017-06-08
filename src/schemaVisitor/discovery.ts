import * as joi from "joi";

import {
  fromPairs,
  has,
  keys,
  mapKeys,
  mapValues,
  pickBy,
  toPairs,
  union,
} from "lodash";

import { Schema } from "./types";

const schemaSuffix = /Schema$/;
const isSchema = (_: any, name: string) => schemaSuffix.test(name);
const hasFactory = (exports: {}) => (name: string) =>
  has(exports, `${name}Factory`);

type Mutator = (kv: Schema) => Schema;

const pairToSchema = ([name, schema]: [string, Schema]) => {
  schema.__name = name;
  return schema;
};

const stripSchemaSuffix: Mutator = schema => {
  schema.__name = schema.__name.replace(schemaSuffix, "");
  return schema;
};

const ensureNoteExists: Mutator = schema => {
  schema._notes = union(schema._notes, [`type:${schema.__name}`]);
  return schema;
};

export const discoverTypes = (exported: {}) => {
  const schemaExports = pickBy(exported, isSchema);

  const schemas: Schema[] = toPairs(schemaExports)
    .map(pairToSchema)
    .map(stripSchemaSuffix)
    .map(ensureNoteExists);

  const factories = Object.keys(schemas).filter(hasFactory(exported));

  return {
    exported: keys(exported),
    factories,
    schemas,
  };
};

export const discoverTypesFromPath = (inputPath: string) => {
  // tslint:disable-next-line:no-var-requires
  const exported = require(inputPath);

  return discoverTypes(exported);
};
