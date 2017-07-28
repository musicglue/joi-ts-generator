import * as joi from "joi";
import { Config } from "../src/config";
import { discoverTypes } from "../src/schemaVisitor/discovery";
import { Schema, VisitedType } from "../src/schemaVisitor/types";
import { visitSchema } from "../src/schemaVisitor/visit";
import { typeToString } from "../src/writers/types";

const nullableConfig: Config = {
  nullableMode: "nullable",
  paths: {
    input: "",
    library: "",
    optics: null,
    project: "",
    types: "",
    utils: "",
  },
  typeImports: {},
};

const optionalConfig: Config = {
  ...nullableConfig,
  nullableMode: "option",
};

describe("when configured to use nullable types", () => {
  describe("writing an array", () => {
    describe("which is simple", () => {
      it("writes the array using the simple syntax", () => {
        const schema = joi
          .array()
          .items(joi.number())
          .notes("type:NumberArray");

        const types = discoverTypes({ NumberArraySchema: schema });
        const type = visitSchema(types.schemas[0]);
        const output = typeToString(nullableConfig)(type);

        expect(output).toEqual("export type NumberArray = number[];\n");
      });
    });

    describe("which is complex", () => {
      it("writes the array using the complex syntax", () => {
        const schema = joi
          .array()
          .items(joi.number().allow(null))
          .notes("type:NullableNumberArray");

        const types = discoverTypes({ NullableNumberArraySchema: schema });
        const type = visitSchema(types.schemas[0]);
        const output = typeToString(nullableConfig)(type);

        expect(output).toEqual("export type NullableNumberArray = Array<number | null>;\n");
      });
    });
  });
});

describe("when configured to use optional types", () => {
  describe("writing an array", () => {
    describe("which is simple", () => {
      it("writes the array using the simple syntax", () => {
        const schema = joi
          .array()
          .items(joi.number())
          .notes("type:NumberArray");

        const types = discoverTypes({ NumberArraySchema: schema });
        const type = visitSchema(types.schemas[0]);
        const output = typeToString(optionalConfig)(type);

        expect(output).toEqual("export type NumberArray = number[];\n");
      });
    });

    describe("which is complex", () => {
      it("writes the array using the complex syntax", () => {
        const schema = joi
          .array()
          .items(joi.number().allow(null))
          .notes("type:NullableNumberArray");

        const types = discoverTypes({ NullableNumberArraySchema: schema });
        const type = visitSchema(types.schemas[0]);
        const output = typeToString(optionalConfig)(type);

        expect(output).toEqual("export type NullableNumberArray = Array<Option<number>>;\n");
      });
    });
  });
});
