import { none, some } from "fp-ts/lib/Option";
import { nameFromNotes } from "./naming";
import { isNullable, isRequired } from "./predicates";

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

    const childType: VisitedType = {
      class: basicType,
      name: nameFromNotes(schema),
      nullable: isNullable(schema),
    };

    return some(childType);
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
    nullable: isNullable(schema),
  };

  return some(type);
};
