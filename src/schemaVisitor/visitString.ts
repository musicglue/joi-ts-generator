import { none, some } from "fp-ts/lib/Option";

import { nameFromNotes } from "./naming";

import { BasicType, VisitedType, Visitor } from "./types";

export const visitString: Visitor = visitSchema => schema => {
  if (schema._type !== "string") {
    return none;
  }

  const basicType: BasicType = {
    kind: "basic",
    type: "string",
  };

  const type: VisitedType = {
    class: basicType,
    name: nameFromNotes(schema),
  };

  return some(type);
};
