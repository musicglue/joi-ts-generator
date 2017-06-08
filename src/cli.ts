#!/usr/bin/env ts-node

import fs = require("fs");
import * as joi from "joi";
import {
  find,
  get,
  has,
  identity,
  isObject,
  map,
  mapKeys,
  pick,
  pickBy,
  reduce,
  some,
} from "lodash";
import * as path from "path";
import { Factory } from "rosie";

import readConfig from "./config";
import { discoverTypesFromPath } from "./schemaVisitor/discovery";
import { visit } from "./schemaVisitor/visit";
import { buildLibraryContent } from "./writers/library";
import { buildOpticsContent } from "./writers/optics";
import { buildTypeContent } from "./writers/types";
import { buildUtilsContent } from "./writers/utils";

const config = readConfig();
const { exported, factories, schemas } = discoverTypesFromPath(
  config.paths.input,
);
const types = visit(schemas);

fs.writeFileSync(config.paths.library, buildLibraryContent(config));
fs.writeFileSync(config.paths.types, buildTypeContent(config, types));
fs.writeFileSync(
  config.paths.utils,
  buildUtilsContent(config, exported, factories, types),
);

if (config.paths.optics) {
  fs.writeFileSync(config.paths.optics, buildOpticsContent(config, types));
}
