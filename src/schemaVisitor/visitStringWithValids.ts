import { none, some } from "fp-ts/lib/Option";
import { nameFromNotes } from "./naming";
import { StringUnionType, VisitedType, Visitor } from "./types";

export const visitStringWithValids: Visitor = visitSchema => schema => {
  if (schema._type !== "string") {
    return none;
  }

  const validStrings = schema._valids.values() as string[];

  if (validStrings.length === 0) {
    return none;
  }

  const stringUnion: StringUnionType = {
    alternatives: validStrings,
    kind: "string-union",
  };

  const type: VisitedType = {
    class: stringUnion,
    name: nameFromNotes(schema),
  };

  return some(type);
};
