import { nameFromNotes } from "./naming";
import { isNullable } from "./predicates";
import { Schema, VisitedType } from "./types";

export const visitUnknown = (schema: Schema): VisitedType => ({
  class: { kind: "unknown" },
  name: nameFromNotes(schema),
  nullable: isNullable(schema),
});
