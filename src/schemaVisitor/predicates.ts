import {
  ArrayType,
  BasicType,
  InterfaceType,
  Schema,
  StringAliasType,
  StringUnionType,
  VisitedTypeClass,
} from "./types";

export function isArray(klass: VisitedTypeClass): klass is ArrayType {
  return klass.kind === "array";
}

export function isBasic(klass: VisitedTypeClass): klass is BasicType {
  return klass.kind === "basic";
}

export function isInterface(klass: VisitedTypeClass): klass is InterfaceType {
  return klass.kind === "interface";
}

export function isStringAlias(
  klass: VisitedTypeClass,
): klass is StringAliasType {
  return klass.kind === "string-alias";
}

export function isStringUnion(
  klass: VisitedTypeClass,
): klass is StringUnionType {
  return klass.kind === "string-union";
}

export const isGuid = (schema: Schema) =>
  schema._tests.find(test => test.name === "guid");

export const isRequired = (schema: Schema) =>
  (schema._flags.presence || "optional") === "required";
