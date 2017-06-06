import {
  isBasic,
  isInterface,
  isStringAlias,
  isStringUnion,
} from "./predicates";

import {
  Schema,
  VisitedType,
} from "./types";

const typeNotePrefix = /^type:/;

export const nameFromNotes = (schema: Schema): string =>
  schema
    ._notes
    .filter(note => typeNotePrefix.test(note))
    .map(note => note.replace(typeNotePrefix, ""))[0];

export const toTypeName = (type: VisitedType): string => {
  if (isBasic(type.class)) {
    return type.class.type;
  }

  if (isInterface(type.class)) {
    return type.name;
  }

  if (isStringAlias(type.class)) {
    return type.class.name;
  }

  if (isStringUnion(type.class)) {
    return type.name;
  }

  return "Unknown";
};
