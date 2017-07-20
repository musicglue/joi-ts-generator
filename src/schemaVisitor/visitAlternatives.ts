import { none, some } from "fp-ts/lib/Option";
import { nameFromNotes } from "./naming";
import { UnionType, VisitedType, Visitor } from "./types";

export const visitAlternatives: Visitor = visitSchema => schema => {
  if (schema._type !== "alternatives") {
    return none;
  }

  // tslint:disable-next-line:no-shadowed-variable
  const validAlternatives = (schema._inner as any).matches.map(({ schema }: { schema: any }) =>
    nameFromNotes(schema) || schema._type);

  if (validAlternatives.length === 0) {
    return none;
  }

  const typesUnion: UnionType = {
    alternatives: validAlternatives,
    kind: "union",
  };

  const type: VisitedType = {
    class: typesUnion,
    name: nameFromNotes(schema),
  };

  return some(type);
};
