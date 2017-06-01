// tslint:disable:max-line-length
import { compact } from "lodash";

const buildCommand = (name: string) => `  build: coerceFactory<t.${name}>(s.${name}Factory, s.${name}Schema),`;
const coerceCommand = (name: string) => `  coerce: coerceValue<t.${name}>(s.${name}Schema),`;

const imports = (optionTypes: boolean, libraryPath: string, schemasPath: string, typesPath: string) => [
  `import { coerceFactory, coerceValue } from "${libraryPath}";`,
  `import * as s from "${schemasPath}";`,
  `import * as t from "${typesPath}";`,
].join(`\n`);

// exports

export const baseTemplate = (optionTypes: boolean, libraryPath: string, schemasPath: string, typesPath: string) => compact([
  `// tslint:disable:ordered-imports max-line-length`,
  imports(optionTypes, libraryPath, schemasPath, typesPath),
  `export * from "${libraryPath}";`,
]).join(`\n\n`);

export default (name: string, hasFactory: boolean) =>
  compact([
    `export const ${name}Utils = {`,
    hasFactory ? buildCommand(name) : null,
    coerceCommand(name),
    "};",
  ]).join("\n");
