import fs = require("fs");
import * as joi from "joi";
import * as path from "path";

// tslint:disable-next-line:no-var-requires
const readPkgUp = require("read-pkg-up");

const configSchema = joi.object().keys({
  joiTsGenerator: joi
    .object()
    .keys({
      input: joi.string().required(),
      nullableMode: joi.string().valid("nullable", "option").required(),
      outputs: joi
        .object()
        .keys({
          library: joi.string().required(),
          optics: joi.string(),
          types: joi.string().required(),
          utils: joi.string().required(),
        })
        .required(),
      typeImports: joi.object(),
    })
    .required(),
});

interface Paths {
  input: string;
  library: string;
  optics?: string;
  project: string;
  types: string;
  utils: string;
}

type NullableMode = "nullable" | "option";

export interface Config {
  nullableMode: NullableMode;
  paths: Paths;
  typeImports: object;
}

const readConfig = (): Config => {
  const packageJson = readPkgUp.sync();

  if (!packageJson.pkg) {
    throw new Error(`Could not find package.json in: ${process.cwd()}`);
  }

  const { error, value } = joi.validate(packageJson.pkg, configSchema, {
    allowUnknown: true,
  });

  if (error) {
    throw error;
  }

  const coerced = value.joiTsGenerator;
  const projectPath = path.dirname(packageJson.path);
  const makePath = (p: string) => p.toString().length > 0 ? path.join(projectPath, p) : null;

  const config: Config = {
    nullableMode: coerced.nullableMode,
    paths: {
      input: makePath(coerced.input),
      library: makePath(coerced.outputs.library),
      optics: makePath(coerced.outputs.optics),
      project: path.dirname(packageJson.path),
      types: makePath(coerced.outputs.types),
      utils: makePath(coerced.outputs.utils),
    },
    typeImports: coerced.typeImports || {},
  };

  if (config.paths.optics) {
    config.paths.optics = path.resolve(projectPath, config.paths.optics);
    const stats = fs.statSync(config.paths.optics);

    if (!stats.isDirectory()) {
      throw new Error(`Optics path specified, but path does not exist or is not a directory: ${config.paths.optics}`);
    }

    if (config.nullableMode !== "option") {
      throw new Error("Optics paths is only valid if nullableMode is 'option'");
    }
  }

  return config;
};

export default readConfig;
