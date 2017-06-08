import { none, some } from "fp-ts/lib/Option";
import { nameFromNotes } from "./naming";
import { isGuid } from "./predicates";
import { BasicType, VisitedType, Visitor } from "./types";

export const visitGuid: Visitor = visitSchema => schema => {
  if (schema._type !== "string") {
    return none;
  }

  if (!isGuid(schema)) {
    return none;
  }

  const basicType: BasicType = {
    kind: "basic",
    type: "string",
  };

  const type: VisitedType = {
    class: basicType,
    name: "Uuid",
  };

  return some(type);
};
