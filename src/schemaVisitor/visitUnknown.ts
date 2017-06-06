import { nameFromNotes } from "./naming";

import {
  Schema,
  VisitedType,
} from "./types";

export const visitUnknown = (schema: Schema): VisitedType => ({
  class: { kind: "unknown" },
  name: nameFromNotes(schema),
});
