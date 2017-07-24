import * as option from "fp-ts/lib/Option";
import * as joi from "joi";

import { discoverTypes } from "../src/schemaVisitor/discovery";
import { visit } from "../src/schemaVisitor/visit";
import { coerceValue } from "../src/writers/templates/optionTypeFns";

describe("coerce for option types", () => {
  // this is to avoid having to put .allow(null) on everything that isn't required.

  describe("when an attribute is required()", () => {
    describe("and the attribute is an object", () => {
      test("it does not convert null to undefined before calling joi", () => {
        const schema = joi.object().keys({ name: joi.string().required().allow(null) });
        const output: any = coerceValue(schema)({ name: null });

        expect(output.name === null).toBeTruthy();
      });
    });

    describe("and the attribute is not an object", () => {
      test("it does not convert null to undefined before calling joi", () => {
        const schema = joi.string().allow(null).required();
        const output: any = coerceValue(schema)(null);

        expect(output === null).toBeTruthy();
      });
    });
  });

  describe("when an attribute is not required()", () => {
    describe("and the attribute is an object", () => {
      test("it converts null to undefined before calling joi", () => {
        const schema = joi.object().keys({
          person: joi.object().keys({
             name: joi.string(),
          }).required(),
        });

        const output: any = coerceValue(schema)({ person: { name: null }});

        expect(option.isNone(output.person.name)).toBeTruthy();
      });
    });

    describe("and the attribute is not an object", () => {
      test("it converts null to undefined before calling joi", () => {
        const schema = joi.string().allow(null);
        const output: any = coerceValue(schema)(null);

        expect(option.isNone(output)).toBeTruthy();
      });
    });
  });
});
