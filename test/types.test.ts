import { Config } from "../src/config";
import { VisitedType } from "../src/schemaVisitor/types";
import { typeToString } from "../src/writers/types";

const config: Config = {
    nullableMode: "nullable",
    paths: {
        input: "dummy",
        library: "dummy",
        project: "dummy",
        types: "dummy",
        utils: "dummy",
    },
    typeImports: {},
};

describe("an interface member with special characters", () => {
  test("it is quoted correctly", () => {
    const inputType: VisitedType = {
      class: {
        fields: [
            {
                key: "foo",
                required: true,
                type: {
                    class: {
                        kind: "basic",
                        type: "string",
                    },
                    name: "string",
                },
            },
            {
                key: "foo-dashed",
                required: true,
                type: {
                    class: {
                        kind: "basic",
                        type: "string",
                    },
                    name: "string",
                },
            },
        ],
        kind: "interface",
      },
      name: "Test",
    };
    const outputDecl = typeToString(config)(inputType);
    expect(outputDecl).toBe("" +
        "export interface Test {\n" +
        "  foo: string;\n" +
        "  'foo-dashed': string;\n" +
        "}\n");
  });
});
