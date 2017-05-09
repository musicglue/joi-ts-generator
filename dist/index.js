#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const lodash_1 = require("lodash");
const argv = process.argv;
const sourcePath = argv[2];
const destPath = argv[3];
if (!sourcePath && !destPath) {
    process.exit(1);
}
const objects = require(sourcePath);
const discoveredTypes = [];
const typeCheck = /^type:/;
const addDiscoveredType = (type) => {
    if (discoveredTypes.find((typ) => typ.name === type.name)) {
        return;
    }
    discoveredTypes.push(type);
};
const usableNotes = ({ _notes }) => !!_notes.find((n) => typeCheck.test(n));
const getUnion = (node) => Array.from(lodash_1.get(node, "_valids._set", []));
const propName = ({ key, schema }) => (lodash_1.get(schema, "_flags.presence", "optional") === "required") ? key : `${key}?`;
const joiToTypescript = (type) => {
    switch (type) {
        case "date":
            return "Date";
        default:
            return type;
    }
};
const unwrapArray = ({ _inner: { items } }) => {
    const [item, ...rest] = items;
    if (lodash_1.some(rest)) {
        return `Array<${items.map(deriveType).join(" | ")}>`;
    }
    return `${deriveType(item)}[]`;
};
const nameFromNotes = (notes) => {
    const note = notes.find(n => typeCheck.test(n));
    if (!note) {
        throw new Error("Must provide type information through notes.");
    }
    return note.replace(typeCheck, "");
};
const unwrapNotes = (type, notes) => {
    const name = nameFromNotes(notes);
    addDiscoveredType({ name, type });
    return name;
};
const uuidCheck = (schema) => !!schema._tests.find((t) => t.name === "guid");
const deriveType = (schema) => {
    if (schema._type === "array") {
        return unwrapArray(schema);
    }
    if (usableNotes(schema)) {
        return unwrapNotes(schema._type, schema._notes);
    }
    if (uuidCheck(schema)) {
        addDiscoveredType({ name: "Uuid", type: "string" });
        return "Uuid";
    }
    return joiToTypescript(schema._type);
};
const resolveTypeDefinition = (node) => {
    if (typeof node === "string") {
        return node;
    }
    const baseType = node._type;
    const options = getUnion(node);
    const out = [];
    if (options.length) {
        options.forEach((opt) => {
            const candidate = baseType === "string" ? `"${opt}"` : opt;
            if (out.indexOf(candidate) === -1) {
                out.push(candidate);
            }
        });
    }
    else {
        out.push(joiToTypescript(baseType));
    }
    return out.join(" | ");
};
const writeInterfaceType = (typeName, { _inner: { children } }) => `export interface ${typeName} {
${children.map((child) => `  ${propName(child)}: ${deriveType(child.schema)};`).join("\n")}
}`;
const writeTypeAlias = (typeName, type) => `export type ${typeName} = ${resolveTypeDefinition(type)};`;
const typeWriters = {
    array: writeTypeAlias,
    object: writeInterfaceType,
    string: writeTypeAlias,
};
const runTypeGenerator = () => {
    const output = Object
        .keys(objects)
        .map((typeName) => {
        const type = objects[typeName];
        if (usableNotes(type)) {
            const name = nameFromNotes(type._notes);
            const writer = typeWriters[type._type];
            addDiscoveredType({ name, skip: true });
            return writer(name, type);
        }
        return "";
    });
    discoveredTypes
        .filter(t => !t.skip)
        .forEach(type => output.unshift(writeTypeAlias(type.name, type.type)));
    fs.writeFileSync(destPath, output.join("\n\n"));
};
runTypeGenerator();
