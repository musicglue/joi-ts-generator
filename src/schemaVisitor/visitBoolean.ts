import { none, some } from "fp-ts/lib/Option";

import { nameFromNotes } from "./naming";

import { BasicType, VisitedType, Visitor } from "./types";

export const visitBoolean: Visitor = visitSchema => schema => {
  if (schema._type !== "boolean") {
    return none;
  }

  const basicType: BasicType = {
    kind: "basic",
    type: "boolean",
  };

  const type: VisitedType = {
    class: basicType,
    name: nameFromNotes(schema),
  };

  return some(type);
};
