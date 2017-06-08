import { flatMap, flatten, isString, sortBy, uniqBy } from "lodash";
import { discoverTypes } from "./discovery";
import {
  isArray,
  isInterface,
  isStringAlias,
  isStringUnion,
} from "./predicates";
import { InterfaceType, Schema, VisitedType, Visitor } from "./types";
import { visitArray } from "./visitArray";
import { visitBoolean } from "./visitBoolean";
import { visitDate } from "./visitDate";
import { visitGuid } from "./visitGuid";
import { visitNumber } from "./visitNumber";
import { visitObject } from "./visitObject";
import { buildVisitSchema } from "./visitSchema";
import { visitString } from "./visitString";
import { visitStringWithValids } from "./visitStringWithValids";

const visitors: Visitor[] = [
  visitArray,
  visitObject,
  visitGuid,
  visitStringWithValids,

  visitBoolean,
  visitDate,
  visitNumber,
  visitString,
];

const visitSchema = buildVisitSchema(visitors);

const visitSchemas = (schemas: Schema[]) =>
  schemas.reduce(
    (types, schema) => types.concat([visitSchema(schema)]),
    [] as VisitedType[],
  );

const hoistNestedTypes = (
  state: VisitedType[],
  types: VisitedType[],
): VisitedType[] => {
  const interfaces = types
    .map(type => type.class)
    .filter(isInterface)
    .map(klass => klass as InterfaceType);

  const fields = flatMap(interfaces, iface => iface.fields);
  const fieldTypes = fields.map(field => field.type);
  const namedFieldTypes = fieldTypes.filter(type => isString(type.name));

  const mergedTypes = namedFieldTypes.reduce((memo, type) => {
    if (memo.find(m => m.name === type.name)) {
      return memo;
    }

    return memo.concat([type]);
  }, state);

  if (fieldTypes.length === 0) {
    return mergedTypes;
  }

  return hoistNestedTypes(mergedTypes, fieldTypes);
};

const sortTypes = (types: VisitedType[]): VisitedType[] => {
  return sortBy(types, type => {
    if (isStringAlias(type.class)) {
      return 0;
    }

    if (isStringUnion(type.class)) {
      return 1;
    }

    if (isArray(type.class)) {
      return 2;
    }

    return 3;
  });
};

export const visit = (schemas: Schema[]): VisitedType[] => {
  const firstPass = visitSchemas(schemas);
  const secondPass = hoistNestedTypes(firstPass, firstPass);
  const thirdPass = sortTypes(secondPass);

  return thirdPass;
};
