import { none, some } from "fp-ts/lib/Option";

import { nameFromNotes } from "./naming";
import { isRequired } from "./predicates";

import {
  BasicType,
  Field,
  InterfaceType,
  SchemaVisitor,
  VisitedType,
  Visitor,
} from "./types";

export const visitObject: Visitor = visitSchema => schema => {
  if (schema._type !== "object") {
    return none;
  }

  const children = schema._inner.children || [];

  if (children.length === 0) {
    const basicType: BasicType = {
      kind: "basic",
      type: "object",
    };

    const type: VisitedType = {
      class: basicType,
      name: nameFromNotes(schema),
    };

    return some(type);
  }

  const fields: Field[] = children.map(
    child =>
      ({
        key: child.key,
        required: isRequired(child.schema),
        type: visitSchema(child.schema),
      } as Field),
  );

  const iface: InterfaceType = {
    fields,
    kind: "interface",
  };

  const type: VisitedType = {
    class: iface,
    name: nameFromNotes(schema),
  };

  return some(type);
};
