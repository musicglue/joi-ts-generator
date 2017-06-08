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
  };

  return config;
};

export default readConfig;
