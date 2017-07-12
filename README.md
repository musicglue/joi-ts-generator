# joi-ts-generator

Generate Typescript Types from Joi Schemae

### Installing

```
yarn add --dev @musicglue/joi-ts-generator
```

Then you should add a script to your package json that you can use to regenerate your types,
such as the following:

```json
{
  "scripts": {
    "regenerate-joi-types": "joi-ts-gen"
  },
  "joiTsGenerator": {
    "input": "./src/schemas/index.ts",
    "outputs": {
      "types": "./src/schemas/types.ts",
      "utils": "./src/schemas/utils.ts"
    }
  }
}
```

You can then rebuild your types by running `yarn regenerate-joi-types`.

### Defining

If you define Joi schemae that look like the following:

```ts
import joi = require("joi");

export const Country = joi.string().notes("type:Country");
export const Currency = joi.string().notes("type:Currency");
export const Package = joi.string().valid(["gold", "silver", "bronze"]).notes("type:Package");

export const Purchase = joi.object().keys({
  id: joi.string().guid().required(),
  country: Country,
  currency: Currency.required(),
  cents: joi.number().required(),
  notes: joi.array().items(joi.string()),
  package: Package.required(),
}).notes("type:Purchase");
```

Then this project will generate you Typescript typings as follows:

```ts
export type Uuid = string;
export type Country = string;
export type Currency = string;
export type Package = "gold" | "silver" | "bronze";

export interface Purchase {
  id: Uuid;
  country?: Country;
  currency: Currency;
  cents: number;
  notes?: string[];
  package: Package;
}
```

### Troubleshooting

If you are defining string types and find that you get unexpected results, please follow the following:

```ts
import * as joi from "joi";
import cloneSchema from "@musicglue/joi-ts-generator"

export const Country = cloneSchema(joi.string());
export const Currency = cloneSchema(joi.string());
```

This prevents our internals from overwriting themselves as we parse the schemae. Joi objects are immutable,
other than the entrypoint...
