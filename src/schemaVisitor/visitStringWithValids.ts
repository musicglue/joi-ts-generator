import { none, some } from "fp-ts/lib/Option";
import { compact } from "lodash";
import { nameFromNotes } from "./naming";
import { isNullable } from "./predicates";
import { StringUnionType, VisitedType, Visitor } from "./types";

export const visitStringWithValids: Visitor = visitSchema => schema => {
  if (schema._type !== "string") {
    return none;
  }

  const nullable = isNullable(schema);
  const valids = schema._valids.values() as Array<string | null>;
  const validStrings = compact(valids);

  if (validStrings.length === 0 || !schema._flags.allowOnly) {
    return none;
  }

  const stringUnion: StringUnionType = {
    alternatives: valids,
    kind: "string-union",
  };

  const type: VisitedType = {
    class: stringUnion,
    name: nameFromNotes(schema),
    nullable,
  };

  return some(type);
};
