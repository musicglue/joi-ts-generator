import {
  none,
  some,
} from "fp-ts/lib/Option";

import { isGuid } from "./predicates";

import { nameFromNotes } from "./naming";

import {
  StringAliasType,
  VisitedType,
  Visitor,
} from "./types";

export const visitGuid: Visitor = visitSchema => schema => {
  if (schema._type !== "string") {
    return none;
  }

  if (!isGuid(schema)) {
    return none;
  }

  const stringAliasType: StringAliasType = {
    kind: "string-alias",
    name: "Uuid",
  };

  const type: VisitedType = {
    class: stringAliasType,
    name: "Uuid",
  };

  return some(type);
};
