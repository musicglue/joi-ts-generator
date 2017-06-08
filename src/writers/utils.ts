import { compact, sortBy } from "lodash";
import * as path from "path";
import { Config } from "../config";
import { isStringAlias } from "../schemaVisitor/predicates";
import { VisitedType } from "../schemaVisitor/types";
import { headers } from "./shared";

const relativeImportPath = (from: string, to: string) => {
  const p = path.relative(path.dirname(from), to).replace(/\.ts$/, "");
  return p.charAt(0) === "." ? p : `./${p}`;
};

const buildCommand = (name: string) =>
  `  build: coerceFactory<t.${name}>(s.${name}Factory, s.${name}Schema),`;
const coerceCommand = (name: string) =>
  `  coerce: coerceValue<t.${name}>(s.${name}Schema),`;

const utilBlock = (name: string, hasFactory: boolean) =>
  compact([
    `export const ${name}Utils = {`,
    hasFactory ? buildCommand(name) : null,
    coerceCommand(name),
    `};
`,
  ]).join("\n");

export const buildUtilsContent = (
  config: Config,
  exportedSymbols: string[],
  factories: string[],
  types: VisitedType[],
): string => {
  const coercibleTypes = sortBy(
    types.filter(type => exportedSymbols.includes(`${type.name}Schema`)),
    type => type.name,
  );

  const coercionLines = coercibleTypes.reduce((memo, type) => {
    const hasFactory = factories.includes(type.name);
    return memo.concat([utilBlock(type.name, hasFactory)]);
  }, []);

  const needsFactoryImport = types.find(type => factories.includes(type.name));

  const libraryPath = relativeImportPath(
    config.paths.utils,
    config.paths.library,
  );
  const schemasPath = relativeImportPath(
    config.paths.utils,
    config.paths.input,
  );
  const typesPath = relativeImportPath(config.paths.utils, config.paths.types);

  const lines = headers()
    .concat([
      "",
      `import { ${needsFactoryImport
        ? "coerceFactory, "
        : ""}coerceValue } from "${libraryPath}";`,
      `import * as s from "${schemasPath}";`,
      `import * as t from "${typesPath}";`,
      "",
    ])
    .concat(coercionLines);

  return lines.join(`\n`);
};
