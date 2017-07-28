import { none, some } from "fp-ts/lib/Option";
import { nameFromNotes } from "./naming";
import { isNullable } from "./predicates";
import { BasicType, UnionType, VisitedType, Visitor } from "./types";

const stringType: BasicType = {
  kind: "basic",
  type: "string",
};

const unionType: UnionType = {
  alternatives: ["string", "null"],
  kind: "union",
};

export const visitString: Visitor = visitSchema => schema => {
  if (schema._type !== "string") {
    return none;
  }

  const nullable = isNullable(schema);

  const type: VisitedType = {
    class: nullable ? unionType : stringType,
    name: nameFromNotes(schema),
    nullable,
  };

  return some(type);
};
