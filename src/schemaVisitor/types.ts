import { Option } from "fp-ts/lib/Option";
import * as joi from "joi";

export interface Field {
  key: string;
  type: VisitedType;
  // typeName: string;
  required: boolean;
}

export type BasicTypeNames = "boolean" | "date" | "number" | "object" | "string";

export interface UnionType {
  kind: "union";
  alternatives: string[];
}

export interface ArrayType {
  kind: "array";
  elements: string[];
}

export interface BasicType {
  kind: "basic";
  type: BasicTypeNames;
}

export interface InterfaceType {
  kind: "interface";
  fields: Field[];
}

export interface StringUnionType {
  kind: "string-union";
  alternatives: string[];
}

export interface UnknownType {
  kind: "unknown";
}

export type VisitedTypeClass =
  | ArrayType
  | BasicType
  | InterfaceType
  | StringUnionType
  | UnionType
  | UnknownType;

export interface VisitedType {
  class: VisitedTypeClass;
  name: string;
}

export interface State {
  types: VisitedType[];
}

export interface InnerSchemaChild {
  key: string;
  schema: Schema;
}

export interface InnerSchema {
  children: InnerSchemaChild[];
  items: Schema[];
}

export interface SchemaTest {
  name: string;
  options: any;
}

export interface Schema extends joi.Schema {
  __name: string;
  _flags: any;
  _inner: InnerSchema;
  _notes: string[];
  _tests: SchemaTest[];
  _type: string;
  _valids: any;
}

export type SchemaVisitor = (schema: Schema) => VisitedType;
export type Visitor = (
  visitSchema: SchemaVisitor,
) => (schema: Schema) => Option<VisitedType>;
