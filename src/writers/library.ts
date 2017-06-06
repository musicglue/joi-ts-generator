import fs = require("fs");
import * as path from "path";
import { Config } from "../config";

export const buildLibraryContent = (config: Config): string => {
  const fnsFile = (config.nullableMode === "option") ? "optionTypeFns.ts" : "standardFns.ts";
  return fs.readFileSync(path.resolve(__dirname, "templates", fnsFile), "UTF-8");
};
