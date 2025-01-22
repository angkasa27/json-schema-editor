import { z } from "zod";

// JSONSchema7TypeName
const JSONSchema7TypeName = z.union([
  z.literal("string"),
  z.literal("number"),
  z.literal("integer"),
  z.literal("boolean"),
  z.literal("object"),
  z.literal("array"),
  z.literal("null"),
]);

// JSONSchema7Type
const JSONSchema7Type: z.ZodTypeAny = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.lazy(() => JSONSchema7Object),
  z.lazy(() => JSONSchema7Array),
  z.null(),
]);

// JSONSchema7Object
const JSONSchema7Object = z.record(JSONSchema7Type);

// JSONSchema7Array
const JSONSchema7Array = z.array(JSONSchema7Type);

// JSONSchema7Version
const JSONSchema7Version = z.string();

// JSONSchema7Definition
const JSONSchema7Definition: any = z.union([
  z.lazy(() => JSONSchema7Schema),
  z.boolean(),
]);

// JSONSchema7
export const JSONSchema7Schema = z.object({
  $id: z.string().optional(),
  $ref: z.string().optional(),
  $schema: JSONSchema7Version.optional(),
  $comment: z.string().optional(),

  // Section 6.1
  type: z.union([JSONSchema7TypeName, z.array(JSONSchema7TypeName)]).optional(),
  enum: z.array(JSONSchema7Type).optional(),
  const: JSONSchema7Type.optional(),

  // Section 6.2
  multipleOf: z.number().optional(),
  maximum: z.number().optional(),
  exclusiveMaximum: z.number().optional(),
  minimum: z.number().optional(),
  exclusiveMinimum: z.number().optional(),

  // Section 6.3
  maxLength: z.number().optional(),
  minLength: z.number().optional(),
  pattern: z.string().optional(),

  // Section 6.4
  items: z
    .union([JSONSchema7Definition, z.array(JSONSchema7Definition)])
    .optional(),
  additionalItems: JSONSchema7Definition.optional(),
  maxItems: z.number().optional(),
  minItems: z.number().optional(),
  uniqueItems: z.boolean().optional(),
  contains: z.lazy((): z.ZodTypeAny => JSONSchema7Schema).optional(),

  // Section 6.5
  maxProperties: z.number().optional(),
  minProperties: z.number().optional(),
  required: z.array(z.string()).optional(),
  properties: z.record(JSONSchema7Definition).optional(),
  patternProperties: z.record(JSONSchema7Definition).optional(),
  additionalProperties: JSONSchema7Definition.optional(),
  dependencies: z
    .record(z.union([JSONSchema7Definition, z.array(z.string())]))
    .optional(),
  propertyNames: JSONSchema7Definition.optional(),

  // Section 6.6
  if: JSONSchema7Definition.optional(),
  then: JSONSchema7Definition.optional(),
  else: JSONSchema7Definition.optional(),

  // Section 6.7
  allOf: z.array(JSONSchema7Definition).optional(),
  anyOf: z.array(JSONSchema7Definition).optional(),
  oneOf: z.array(JSONSchema7Definition).optional(),
  not: JSONSchema7Definition.optional(),

  // Section 7
  format: z.string().optional(),

  // Section 8
  contentMediaType: z.string().optional(),
  contentEncoding: z.string().optional(),

  // Section 9
  definitions: z.record(JSONSchema7Definition).optional(),

  // Section 10
  title: z.string().optional(),
  description: z.string().optional(),
  default: JSONSchema7Type.optional(),
  readOnly: z.boolean().optional(),
  writeOnly: z.boolean().optional(),
  examples: JSONSchema7Type.optional(),
});
