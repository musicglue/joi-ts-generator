import { none, some } from "fp-ts/lib/Option";
import { uniq } from "lodash";
import { nameFromNotes } from "./naming";
import { isNullable } from "./predicates";
import { UnionType, VisitedType, Visitor } from "./types";

export const visitAlternatives: Visitor = visitSchema => schema => {
  if (schema._type !== "alternatives") {
    return none;
  }

  const matches = (schema._inner as any).matches as any[];

  // tslint:disable-next-line:no-shadowed-variable
  const validAlternatives = uniq(matches.map(({ schema }: { schema: any }) =>
    nameFromNotes(schema) || (schema._type as string)));

  if (validAlternatives.length === 0) {
    return none;
  }

  const typesUnion: UnionType = {
    alternatives: validAlternatives.sort(),
    kind: "union",
  };

  const type: VisitedType = {
    class: typesUnion,
    name: nameFromNotes(schema),
    nullable: isNullable(schema),
  };

  return some(type);
};
