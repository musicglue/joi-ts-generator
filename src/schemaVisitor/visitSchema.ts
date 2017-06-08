import { empty } from "fp-ts/lib/Option";

import { Schema, VisitedType, Visitor } from "./types";

import { visitUnknown } from "./visitUnknown";

export const buildVisitSchema = (visitors: Visitor[]) => {
  const visitSchema = (schema: Schema): VisitedType =>
    visitors
      .reduce(
        (state, visit) => state.alt(visit(visitSchema)(schema)),
        empty<VisitedType>(),
      )
      .getOrElse(() => visitUnknown(schema));

  return visitSchema;
};
