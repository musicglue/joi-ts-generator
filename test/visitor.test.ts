import * as joi from "joi";

import { discoverTypes } from "../src/schemaVisitor/discovery";
import { visit } from "../src/schemaVisitor/visit";

import {
  isArray,
  isBasic,
  isInterface,
  isStringUnion,
} from "../src/schemaVisitor/predicates";

describe("a schema that has no Schema suffix", () => {
  test("it is not discovered", () => {
    const schema = joi.string().uppercase().valid(["apple", "orange"]);
    const types = visit([], discoverTypes({ Foo: schema }).schemas);

    expect(types).toHaveLength(0);
  });
});

describe("a schema describing a string union", () => {
  test("it is discovered as a string union", () => {
    const schema = joi.string().uppercase().valid(["apple", "orange"]);
    const types = visit([], discoverTypes({ FruitSchema: schema }).schemas);

    expect(types).toHaveLength(1);

    const type = types[0];

    if (!isStringUnion(type.class)) {
      return fail();
    }

    expect(type.name).toEqual("Fruit");
    expect(type.class.alternatives).toEqual(["apple", "orange"]);
  });
});

describe("a schema describing a string that allows blanks", () => {
  test("it is discovered as a string", () => {
    const schema = joi.string().uppercase().allow("");
    const types = visit([], discoverTypes({ FruitSchema: schema }).schemas);

    expect(types).toHaveLength(1);

    const type = types[0];

    if (!isBasic(type.class)) {
      return fail();
    }

    expect(type.name).toEqual("Fruit");
    expect(type.class.type).toEqual("string");
  });
});

describe("a schema describing an object with a single optional string field", () => {
  test("it is discovered as an interface", () => {
    const schema = joi.object().keys({
      title: joi.string(),
    });

    const types = visit([], discoverTypes({ BookSchema: schema }).schemas);

    expect(types).toHaveLength(1);

    const type = types[0];

    if (!isInterface(type.class)) {
      return fail();
    }

    expect(type.name).toEqual("Book");
    expect(type.class.fields).toHaveLength(1);
    expect(type.class.fields[0].key).toEqual("title");
    expect(type.class.fields[0].required).toEqual(false);

    const fieldType = type.class.fields[0].type;

    if (!isBasic(fieldType.class)) {
      return fail();
    }

    expect(fieldType.class.kind).toEqual("basic");
    expect(fieldType.class.type).toEqual("string");
  });
});

describe("a schema describing an object with a single required string field", () => {
  test("it is discovered as an interface", () => {
    const schema = joi.object().keys({
      title: joi.string().required(),
    });

    const types = visit([], discoverTypes({ BookSchema: schema }).schemas);

    expect(types).toHaveLength(1);

    const type = types[0];

    if (!isInterface(type.class)) {
      return fail();
    }

    expect(type.name).toEqual("Book");
    expect(type.class.fields).toHaveLength(1);
    expect(type.class.fields[0].key).toEqual("title");
    expect(type.class.fields[0].required).toEqual(true);

    const fieldType = type.class.fields[0].type;

    if (!isBasic(fieldType.class)) {
      return fail();
    }

    expect(fieldType.class.kind).toEqual("basic");
    expect(fieldType.class.type).toEqual("string");
  });
});

describe("a schema describing an object with a single optional number field", () => {
  test("it is discovered as an interface", () => {
    const schema = joi.object().keys({
      age: joi.number(),
    });

    const types = visit([], discoverTypes({ DemographicSchema: schema }).schemas);

    expect(types).toHaveLength(1);

    const type = types[0];

    if (!isInterface(type.class)) {
      return fail();
    }

    expect(type.name).toEqual("Demographic");
    expect(type.class.fields).toHaveLength(1);
    expect(type.class.fields[0].key).toEqual("age");
    expect(type.class.fields[0].required).toEqual(false);

    const fieldType = type.class.fields[0].type;

    if (!isBasic(fieldType.class)) {
      return fail();
    }

    expect(fieldType.class.kind).toEqual("basic");
    expect(fieldType.class.type).toEqual("number");
  });
});

describe("a schema describing an object with a single required boolean field", () => {
  test("it is discovered as an interface", () => {
    const schema = joi.object().keys({
      accepted: joi.boolean().required(),
    });

    const types = visit([], discoverTypes({ FormAcceptanceSchema: schema }).schemas);

    expect(types).toHaveLength(1);

    const type = types[0];

    if (!isInterface(type.class)) {
      return fail();
    }

    expect(type.name).toEqual("FormAcceptance");
    expect(type.class.fields).toHaveLength(1);
    expect(type.class.fields[0].key).toEqual("accepted");
    expect(type.class.fields[0].required).toEqual(true);

    const fieldType = type.class.fields[0].type;

    if (!isBasic(fieldType.class)) {
      return fail();
    }

    expect(fieldType.class.kind).toEqual("basic");
    expect(fieldType.class.type).toEqual("boolean");
  });
});

describe("a schema describing an object with a single required date field", () => {
  test("it is discovered as an interface", () => {
    const schema = joi.object().keys({
      timestamp: joi.date().required(),
    });

    const types = visit([], discoverTypes({ EventSchema: schema }).schemas);

    expect(types).toHaveLength(1);

    const interfaceType = types[0];

    if (!isInterface(interfaceType.class)) {
      return fail();
    }

    expect(interfaceType.name).toEqual("Event");
    expect(interfaceType.class.fields).toHaveLength(1);
    expect(interfaceType.class.fields[0].key).toEqual("timestamp");
    expect(interfaceType.class.fields[0].required).toEqual(true);

    const fieldType0 = interfaceType.class.fields[0].type;

    if (!isBasic(fieldType0.class)) {
      return fail();
    }

    expect(fieldType0.class.kind).toEqual("basic");
    expect(fieldType0.class.type).toEqual("date");
  });
});

describe("a schema describing an object with a single required guid field", () => {
  test("it is discovered as an interface", () => {
    const schema = joi.object().keys({
      id: joi.string().guid().required(),
    });

    const types = visit([], discoverTypes({ UniqueSchema: schema }).schemas);

    expect(types).toHaveLength(2);

    const aliasType = types[0];

    if (!isBasic(aliasType.class)) {
      return fail();
    }

    expect(aliasType.name).toEqual("Uuid");

    const interfaceType = types[1];

    if (!isInterface(interfaceType.class)) {
      return fail();
    }

    expect(interfaceType.name).toEqual("Unique");
    expect(interfaceType.class.fields).toHaveLength(1);
    expect(interfaceType.class.fields[0].key).toEqual("id");
    expect(interfaceType.class.fields[0].required).toEqual(true);

    const fieldType0 = interfaceType.class.fields[0].type;

    if (!isBasic(fieldType0.class)) {
      return fail();
    }

    expect(fieldType0.class.kind).toEqual("basic");
    expect(fieldType0.class.type).toEqual("string");
  });
});

describe("a schema describing an object with a single array field of a basic type", () => {
  test("it is discovered as an interface", () => {
    const schema = joi.object().keys({
      numberOptions: joi.array().items(joi.number().required()),
    });

    const types = visit([], discoverTypes({ NumberOptionsSchema: schema }).schemas);

    expect(types).toHaveLength(1);

    const type = types[0];

    if (!isInterface(type.class)) {
      return fail();
    }

    expect(type.name).toEqual("NumberOptions");
    expect(type.class.fields).toHaveLength(1);
    expect(type.class.fields[0].key).toEqual("numberOptions");
    expect(type.class.fields[0].required).toEqual(false);

    const fieldType = type.class.fields[0].type;

    if (!isArray(fieldType.class)) {
      return fail();
    }

    expect(fieldType.class.kind).toEqual("array");
    expect(fieldType.class.elements).toEqual(["number"]);
  });
});

describe("a schema describing an object with a single array field of an alias type", () => {
  test("it is discovered as an interface", () => {
    const schema = joi.object().keys({
      uuidOptions: joi.array().items(joi.string().guid().required()).required(),
    });

    const types = visit([], discoverTypes({ UuidOptionsSchema: schema }).schemas);

    expect(types).toHaveLength(1);

    const type = types[0];

    if (!isInterface(type.class)) {
      return fail();
    }

    expect(type.name).toEqual("UuidOptions");
    expect(type.class.fields).toHaveLength(1);
    expect(type.class.fields[0].key).toEqual("uuidOptions");
    expect(type.class.fields[0].required).toEqual(true);

    const fieldType = type.class.fields[0].type;

    if (!isArray(fieldType.class)) {
      return fail();
    }

    expect(fieldType.class.kind).toEqual("array");
    expect(fieldType.class.elements).toEqual(["Uuid"]);
  });
});

describe("a schema describing an object with a single array field of heterogenous basic types", () => {
  test("it is discovered as an interface", () => {
    const schema = joi.object().keys({
      basicOptions: joi.array().items(
        joi.string().required(),
        joi.boolean()),
    });

    const types = visit([], discoverTypes({ BasicOptionsSchema: schema }).schemas);

    expect(types).toHaveLength(1);

    const type = types[0];

    if (!isInterface(type.class)) {
      return fail();
    }

    expect(type.name).toEqual("BasicOptions");
    expect(type.class.fields).toHaveLength(1);
    expect(type.class.fields[0].key).toEqual("basicOptions");
    expect(type.class.fields[0].required).toEqual(false);

    const fieldType = type.class.fields[0].type;

    if (!isArray(fieldType.class)) {
      return fail();
    }

    expect(fieldType.class.kind).toEqual("array");
    expect(fieldType.class.elements).toEqual(["string", "boolean"]);
  });
});

describe("a schema describing an object with a single array field of heterogenous types", () => {
  test("it is discovered as an interface", () => {
    const stringUnionSchema = joi.string().valid("aaa", "bbb");

    const interfaceSchema = joi.object().keys({
      age: joi.number().required(),
      name: joi.string().required(),
    });

    const optionsSchema = joi.object().keys({
      arrayOptions: joi.array().items(
        stringUnionSchema,
        interfaceSchema,
        joi.boolean()),
    });

    const types = visit([], discoverTypes({
      InterfaceSchema: interfaceSchema,
      OptionsSchema: optionsSchema,
      StringUnionSchema: stringUnionSchema,
    }).schemas);

    expect(types).toHaveLength(3);

    const unionType = types[0];

    if (!isStringUnion(unionType.class)) {
      return fail();
    }

    const interfaceType = types[1];

    if (!isInterface(interfaceType.class)) {
      return fail();
    }

    const optionsType = types[2];

    if (!isInterface(optionsType.class)) {
      return fail();
    }

    expect(optionsType.name).toEqual("Options");
    expect(optionsType.class.fields).toHaveLength(1);
    expect(optionsType.class.fields[0].key).toEqual("arrayOptions");
    expect(optionsType.class.fields[0].required).toEqual(false);

    const fieldType = optionsType.class.fields[0].type;

    if (!isArray(fieldType.class)) {
      return fail();
    }

    expect(fieldType.class.kind).toEqual("array");
    expect(fieldType.class.elements).toEqual(["StringUnion", "Interface", "boolean"]);
  });
});

describe("a schema describing an object with all the non-interface types", () => {
  test("it is discovered as an interface", () => {
    const schema = joi.object().keys({
      boolean: joi.bool().required(),
      date: joi.date(),
      guid: joi.string().guid().required(),
      number: joi.number(),
      object: joi.object(),
      string: joi.string().required(),
      whitelist: joi.string().valid("abc", "xyz"),
    });

    const types = visit([], discoverTypes({ SimpleTypesSchema: schema }).schemas);

    expect(types).toHaveLength(2);

    const uuidType = types[0];

    if (!isBasic(uuidType.class)) {
      fail();
    }

    expect(uuidType.name).toEqual("Uuid");

    const interfaceType = types[1];

    if (!isInterface(interfaceType.class)) {
      return fail();
    }

    expect(interfaceType.name).toEqual("SimpleTypes");
    expect(interfaceType.class.fields).toHaveLength(7);

    const field0 = interfaceType.class.fields[0];
    const field1 = interfaceType.class.fields[1];
    const field2 = interfaceType.class.fields[2];
    const field3 = interfaceType.class.fields[3];
    const field4 = interfaceType.class.fields[4];
    const field5 = interfaceType.class.fields[5];
    const field6 = interfaceType.class.fields[6];

    expect(field0.key).toEqual("boolean");
    expect(field0.required).toEqual(true);
    expect(field1.key).toEqual("date");
    expect(field1.required).toEqual(false);
    expect(field2.key).toEqual("guid");
    expect(field2.required).toEqual(true);
    expect(field3.key).toEqual("number");
    expect(field3.required).toEqual(false);
    expect(field4.key).toEqual("object");
    expect(field4.required).toEqual(false);
    expect(field5.key).toEqual("string");
    expect(field5.required).toEqual(true);
    expect(field6.key).toEqual("whitelist");
    expect(field6.required).toEqual(false);

    if (!isBasic(field0.type.class)) {
      return fail();
    }

    expect(field0.type.class.type).toEqual("boolean");

    if (!isBasic(field1.type.class)) {
      return fail();
    }

    expect(field1.type.class.type).toEqual("date");

    if (!isBasic(field2.type.class)) {
      return fail();
    }

    expect(field2.type.name).toEqual("Uuid");

    if (!isBasic(field3.type.class)) {
      return fail();
    }

    expect(field3.type.class.type).toEqual("number");

    if (!isBasic(field4.type.class)) {
      return fail();
    }

    expect(field4.type.class.type).toEqual("object");

    if (!isBasic(field5.type.class)) {
      return fail();
    }

    expect(field5.type.class.type).toEqual("string");

    if (!isStringUnion(field6.type.class)) {
      return fail();
    }

    expect(field6.type.class.alternatives).toEqual(["abc", "xyz"]);
  });
});

describe("a schema describing a relationship between two interface schemas", () => {
  test("it is discovered as two related interface", () => {
    const jobSchema = joi.object().keys({
      title: joi.string().required(),
    }).notes("type:Job");

    const personSchema = joi.object().keys({
      job: jobSchema.required(),
      name: joi.string().required(),
    });

    const types = visit([], discoverTypes({
      JobSchema: jobSchema,
      PersonSchema: personSchema,
    }).schemas);

    expect(types).toHaveLength(2);

    const job = types[0];

    if (!isInterface(job.class)) {
      return fail();
    }

    const person = types[1];

    if (!isInterface(person.class)) {
      return fail();
    }

    expect(job.name).toEqual("Job");
    expect(job.class.fields).toHaveLength(1);
    expect(job.class.fields[0].key).toEqual("title");
    expect(job.class.fields[0].required).toEqual(true);

    const jobTitleFieldType = job.class.fields[0].type;

    if (!isBasic(jobTitleFieldType.class)) {
      return fail();
    }

    // expect(jobTitleFieldType.name).toEqual("basic");
    expect(jobTitleFieldType.class.kind).toEqual("basic");
    expect(jobTitleFieldType.class.type).toEqual("string");

    expect(person.name).toEqual("Person");
    expect(person.class.fields).toHaveLength(2);
    expect(person.class.fields[0].key).toEqual("job");
    expect(person.class.fields[0].required).toEqual(true);
    expect(person.class.fields[1].key).toEqual("name");
    expect(person.class.fields[1].required).toEqual(true);

    const personJobFieldType = person.class.fields[0].type;

    if (!isInterface(personJobFieldType.class)) {
      return fail();
    }

    expect(personJobFieldType.name).toEqual("Job");
    expect(personJobFieldType.class.kind).toEqual("interface");
  });
});

describe("when an interface type contains a named nested schema", () => {
  test("it adds the nested type to the top level array of types", () => {
    const innerSchema = joi.string().valid(["dogs", "cats"]).notes("type:Inner");

    const outerSchema = joi.object().keys({
      foo: joi.number().required(),
      inner: innerSchema.required(),
      inner2: innerSchema,
    });

    const types = visit([], discoverTypes({
      OuterSchema: outerSchema,
    }).schemas);

    expect(types).toHaveLength(2);
  });
});
