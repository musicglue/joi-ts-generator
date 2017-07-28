import { compose, not } from "fp-ts/lib/function";

import {
  ArrayType,
  BasicType,
  Field,
  InterfaceType,
  Schema,
  StringUnionType,
  UnionType,
  VisitedType,
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

export function isStringUnion(
  klass: VisitedTypeClass,
): klass is StringUnionType {
  return klass.kind === "string-union";
}

export function isUnion(klass: VisitedTypeClass): klass is UnionType {
  return klass.kind === "union";
}

export const isGuid = (schema: Schema) =>
  schema._tests.find(test => test.name === "guid");

export const isRequired = (schema: Schema) =>
  (schema._flags.presence || "optional") === "required";

export const isNullable = (schema: Schema) =>
  (schema._valids.values() as any[]).includes(null);

export const isOptionalField = (f: Field) => !f.required;

export const hasOptionalField = (t: VisitedType) =>
  isInterface(t.class) && t.class.fields.some(isOptionalField);
