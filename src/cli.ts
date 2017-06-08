#!/usr/bin/env ts-node

import fs = require("fs");
import * as joi from "joi";
import {
  keys,
} from "lodash";
import * as path from "path";
import { Factory } from "rosie";
import readConfig from "./config";
import { discoverTypesFromPath } from "./schemaVisitor/discovery";
import { visit } from "./schemaVisitor/visit";
import { buildLibraryContent } from "./writers/library";
import { writeOpticsContent } from "./writers/optics";
import { buildTypeContent } from "./writers/types";
import { buildUtilsContent } from "./writers/utils";

const config = readConfig();
const { exported, factories, schemas } = discoverTypesFromPath(
  config.paths.input,
);

const types = visit(keys(config.typeImports), schemas);

fs.writeFileSync(config.paths.library, buildLibraryContent(config));
fs.writeFileSync(config.paths.types, buildTypeContent(config, types));
fs.writeFileSync(
  config.paths.utils,
  buildUtilsContent(config, exported, factories, types),
);

if (config.paths.optics) {
  writeOpticsContent(config, types);
}
