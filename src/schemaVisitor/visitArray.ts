import { none, some } from "fp-ts/lib/Option";

import { nameFromNotes, toTypeName } from "./naming";

import { ArrayType, VisitedType, VisitedTypeClass, Visitor } from "./types";

export const visitArray: Visitor = visitSchema => schema => {
  if (schema._type !== "array") {
    return none;
  }

  const elements: string[] = schema._inner.items
    .map(visitSchema)
    .map(toTypeName);

  const arrayType: ArrayType = {
    elements,
    kind: "array",
  };

  const type: VisitedType = {
    class: arrayType,
    name: nameFromNotes(schema),
  };

  return some(type);
};
