import type { JSONSchema7 } from "./types";

export const SCHEMA_SAMPLES: Record<string, Partial<JSONSchema7>> = {
  "draft-07": {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: "https://example.com/product.schema.json",
    title: "Product (Draft 07)",
    description: "A product from Acme's catalog",
    type: "object",
    properties: {
      productId: {
        description: "The unique identifier for a product",
        type: "integer",
      },
      productName: {
        description: "Name of the product",
        type: "string",
      },
      price: {
        description: "The price of the product",
        type: "number",
        exclusiveMinimum: 0,
      },
      tags: {
        description: "Tags for the product",
        type: "array",
        items: {
          type: "string",
        },
        minItems: 1,
        uniqueItems: true,
      },
      supportEmail: {
        description: "Support email address",
        type: "string",
        format: "email",
      },
    },
    required: ["productId", "productName", "price"],
  },
  "draft-2019-09": {
    $schema: "https://json-schema.org/draft/2019-09/schema",
    $id: "https://example.com/user.schema.json",
    title: "User Profile (Draft 2019-09)",
    description: "A user profile with complex dependencies",
    type: "object",
    properties: {
      username: {
        type: "string",
        minLength: 4,
        maxLength: 20,
      },
      age: {
        type: "integer",
        minimum: 18,
      },
      creditCard: {
        type: "string",
        pattern: "^[0-9]{16}$",
      },
      billingAddress: {
        $ref: "#/$defs/address",
      },
      websites: {
        type: "array",
        items: {
          type: "string",
          format: "uri",
        },
      },
      metadata: {
        type: "object",
        additionalProperties: { type: "string" },
      },
    },
    dependentRequired: { // specific to 2019-09 instead of dependencies
      creditCard: ["billingAddress"],
    },
    required: ["username", "age"],
    $defs: {
      address: {
        type: "object",
        properties: {
          street: { type: "string" },
          city: { type: "string" },
          country: { type: "string" },
        },
        required: ["street", "city"],
      },
    },
  } as unknown as JSONSchema7,
  "draft-2020-12": {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: "https://example.com/geodata.schema.json",
    title: "Geographical Data (Draft 2020-12)",
    description: "A geographical point with tuple validation",
    type: "object",
    properties: {
      location: {
        type: "array",
        prefixItems: [ // specific to 2020-12 instead of items array
          { type: "number", minimum: -90, maximum: 90 }, // latitude
          { type: "number", minimum: -180, maximum: 180 }, // longitude
        ],
        items: false, // no additional items allowed
      },
      elevation: {
        type: "number",
      },
    },
    required: ["location"],
  } as unknown as JSONSchema7,
};
