import { Config } from "../config";
import { isInterface } from "../schemaVisitor/predicates";
import { VisitedType } from "../schemaVisitor/types";
import { headers } from "./shared";

export const buildOpticsContent = (config: Config, types: VisitedType[]): string => {
  const interfaces = types.filter(type => isInterface(type.class));

  // interfaces.map(iface => {

  // });

  return headers().join(`\n`);
};
