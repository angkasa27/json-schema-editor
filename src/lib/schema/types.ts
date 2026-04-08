// =============================================================================
// JSON Schema Draft 07 Types
// https://tools.ietf.org/html/draft-handrews-json-schema-validation-01
// =============================================================================

/**
 * Primitive type names
 * @see https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.1.1
 */
export type JSONSchema7TypeName =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "object"
  | "array"
  | "null";

/**
 * Primitive type values
 */
export type JSONSchema7Type =
  | string
  | number
  | boolean
  | JSONSchema7Object
  | JSONSchema7Array
  | null;

// Workaround for infinite type recursion
export interface JSONSchema7Object {
  [key: string]: JSONSchema7Type;
}

export type JSONSchema7Array = Array<JSONSchema7Type>;

export type JSONSchema7Version = string;

export type JSONSchema7Definition = JSONSchema7 | boolean;

/**
 * JSON Schema v7 interface
 * @see https://tools.ietf.org/html/draft-handrews-json-schema-validation-01
 */
export interface JSONSchema7 {
  $id?: string;
  $ref?: string;
  $schema?: JSONSchema7Version;
  $comment?: string;

  // Section 6.1 - Type
  type?: JSONSchema7TypeName | JSONSchema7TypeName[];
  enum?: JSONSchema7Type[];
  const?: JSONSchema7Type;

  // Section 6.2 - Numeric
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: number;
  minimum?: number;
  exclusiveMinimum?: number;

  // Section 6.3 - String
  maxLength?: number;
  minLength?: number;
  pattern?: string;

  // Section 6.4 - Array
  items?: JSONSchema7Definition | JSONSchema7Definition[];
  additionalItems?: JSONSchema7Definition;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  contains?: JSONSchema7;

  // Section 6.5 - Object
  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  properties?: {
    [key: string]: JSONSchema7Definition;
  };
  patternProperties?: {
    [key: string]: JSONSchema7Definition;
  };
  additionalProperties?: JSONSchema7Definition;
  dependencies?: {
    [key: string]: JSONSchema7Definition | string[];
  };
  propertyNames?: JSONSchema7Definition;

  // Section 6.6 - Conditional
  if?: JSONSchema7Definition;
  then?: JSONSchema7Definition;
  else?: JSONSchema7Definition;

  // Section 6.7 - Composition
  allOf?: JSONSchema7Definition[];
  anyOf?: JSONSchema7Definition[];
  oneOf?: JSONSchema7Definition[];
  not?: JSONSchema7Definition;

  // Section 7 - Format
  format?: string;

  // Section 8 - Content
  contentMediaType?: string;
  contentEncoding?: string;

  // Section 9 - Definitions
  definitions?: {
    [key: string]: JSONSchema7Definition;
  };

  // Section 10 - Annotations
  title?: string;
  description?: string;
  default?: JSONSchema7Type;
  readOnly?: boolean;
  writeOnly?: boolean;
  examples?: JSONSchema7Type;
}

// =============================================================================
// Editor-specific types
// =============================================================================

export type SchemaEditorProps = {
  data?: JSONSchema7 | string;
  onSchemaChange?: (schema: JSONSchema7) => void;
  handleAdvancedSettingClick?: (
    namePath: number[],
    schema: JSONSchema7,
    propertyName?: string
  ) => boolean;
};
