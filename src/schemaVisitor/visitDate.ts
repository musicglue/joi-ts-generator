import { none, some } from "fp-ts/lib/Option";

import { nameFromNotes } from "./naming";

import { StringAliasType, VisitedType, Visitor } from "./types";

export const visitDate: Visitor = visitSchema => schema => {
  if (schema._type !== "date") {
    return none;
  }

  const stringAliasType: StringAliasType = {
    kind: "string-alias",
    name: "Date",
  };

  const type: VisitedType = {
    class: stringAliasType,
    name: "Date",
  };

  return some(type);
};
