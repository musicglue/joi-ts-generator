import { none, some } from "fp-ts/lib/Option";
import { flatten, uniq } from "lodash";
import { nameFromNotes, toTypeName } from "./naming";
import { isNullable } from "./predicates";
import { ArrayType, VisitedType, VisitedTypeClass, Visitor } from "./types";

export const visitArray: Visitor = visitSchema => schema => {
  if (schema._type !== "array") {
    return none;
  }

  const elements: Array<string | null> = uniq(
    flatten(
      schema._inner.items
        .map(visitSchema)
        .map(visitedType => {
          const typeName = toTypeName(visitedType);
          return visitedType.nullable ? [typeName, null] : [typeName];
        })));

  const arrayType: ArrayType = {
    elements,
    kind: "array",
  };

  const type: VisitedType = {
    class: arrayType,
    name: nameFromNotes(schema),
    nullable: isNullable(schema),
  };

  return some(type);
};
