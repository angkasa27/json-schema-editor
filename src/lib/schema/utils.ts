import $RefParser from "@apidevtools/json-schema-ref-parser";
import type {
  JSONSchema7,
  JSONSchema7Definition,
  JSONSchema7TypeName,
} from "./types";

// =============================================================================
// Constants
// =============================================================================

export const DEFAULT_JSON_SCHEMA: JSONSchema7 = {
  type: "object",
  properties: {
    field: { type: "string" },
  },
};

export const SCHEMA_TYPES: JSONSchema7TypeName[] = [
  "string",
  "number",
  "integer",
  "boolean",
  "object",
  "array",
];

export const SCHEMA_TYPE_OPTIONS = SCHEMA_TYPES.map((value) => ({ value }));

export const STRING_FORMATS = [
  { value: "date-time", label: "Date-Time" },
  { value: "date", label: "Date" },
  { value: "time", label: "Time" },
  { value: "email", label: "Email" },
  { value: "hostname", label: "Hostname" },
  { value: "ipv4", label: "IPv4" },
  { value: "ipv6", label: "IPv6" },
  { value: "uri", label: "URI" },
  { value: "regex", label: "Regex" },
];

// =============================================================================
// Schema Helpers
// =============================================================================

/**
 * Get the default schema for a given type
 */
export function getDefaultSchema(
  type: JSONSchema7TypeName | JSONSchema7TypeName[]
): JSONSchema7Definition {
  switch (type) {
    case "string":
      return { type: "string" };
    case "number":
      return { type: "number" };
    case "boolean":
      return { type: "boolean" };
    case "object":
      return { type: "object", properties: {} };
    case "integer":
      return { type: "integer" };
    case "array":
      return { type: "array", items: { type: "string" } };
    case "null":
      return { type: "null" };
    default:
      return { type: "string" };
  }
}

/**
 * Get the index of a property key within an object
 */
export function getPropertyIndex(obj: unknown, propName: string): number {
  if (obj === null || typeof obj !== "object") {
    return -1;
  }
  return Object.keys(obj).indexOf(propName);
}

/**
 * Infer a JSON Schema from a data value
 */
export function inferSchema(data: unknown): JSONSchema7 {
  const getType = (value: unknown): string => {
    if (Array.isArray(value)) return "array";
    if (value === null) return "null";
    return typeof value;
  };

  const generateSchema = (value: unknown): JSONSchema7 => {
    const type = getType(value);

    switch (type) {
      case "object": {
        const properties: Record<string, JSONSchema7> = {};
        const obj = value as Record<string, unknown>;
        for (const key of Object.keys(obj)) {
          properties[key] = generateSchema(obj[key]);
        }
        return {
          type: "object",
          properties,
          required: Object.keys(obj),
        };
      }
      case "array": {
        const arr = value as unknown[];
        return {
          type: "array",
          items: arr.length > 0 ? generateSchema(arr[0]) : {},
        };
      }
      default:
        return { type: type as JSONSchema7TypeName };
    }
  };

  return generateSchema(data);
}

/**
 * Parse a string as JSON, returning undefined if invalid
 */
export function parseJsonStr(str: unknown): Record<string, unknown> | undefined {
  if (typeof str !== "string") return undefined;

  const trimmed = str.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return undefined;
    }
  }
  return undefined;
}

// =============================================================================
// $ref Resolution
// =============================================================================

/**
 * Resolve internal $ref references within a schema
 */
function resolveRef(
  schema: Record<string, unknown>,
  rootSchema: Record<string, unknown>
): Record<string, unknown> {
  if (schema.$ref && typeof schema.$ref === "string") {
    const refPath = schema.$ref;
    if (refPath.startsWith("#/")) {
      const refParts = refPath.slice(2).split("/");
      let current: Record<string, unknown> = structuredClone(rootSchema);
      for (const part of refParts) {
        if (current[part] && typeof current[part] === "object") {
          current = current[part] as Record<string, unknown>;
        } else {
          throw new Error(`Unable to resolve $ref: ${refPath}`);
        }
      }
      return current;
    }
    throw new Error(`Unsupported $ref format: ${refPath}`);
  }

  // Recursively resolve in properties
  if (schema.properties && typeof schema.properties === "object") {
    const props = schema.properties as Record<string, Record<string, unknown>>;
    for (const key of Object.keys(props)) {
      if (props[key]) {
        props[key] = resolveRef(props[key], rootSchema);
      }
    }
  }

  // Recursively resolve in items
  if (schema.items) {
    if (Array.isArray(schema.items)) {
      schema.items = schema.items.map((item: Record<string, unknown>) =>
        resolveRef(item, rootSchema)
      );
    } else if (typeof schema.items === "object") {
      schema.items = resolveRef(
        schema.items as Record<string, unknown>,
        rootSchema
      );
    }
  }

  // Recursively resolve in composition keywords
  for (const keyword of ["oneOf", "anyOf", "allOf"] as const) {
    if (Array.isArray(schema[keyword])) {
      (schema[keyword] as Record<string, unknown>[]) = (
        schema[keyword] as Record<string, unknown>[]
      ).map((option) => resolveRef(option, rootSchema));
    }
  }

  return schema;
}

/**
 * Resolve all $ref in a JSON Schema using json-schema-ref-parser
 */
export async function resolveJsonSchemaRef(
  schema: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const resolved = await $RefParser.dereference(schema, {
    mutateInputSchema: false,
    dereference: { circular: "ignore" },
  });

  // Check if there are any remaining internal refs
  const hasRef = (obj: unknown): boolean => {
    if (!obj || typeof obj !== "object") return false;
    const record = obj as Record<string, unknown>;
    if (record.$ref && typeof record.$ref === "string") return true;
    return Object.values(record).some(hasRef);
  };

  if (hasRef(resolved)) {
    return resolveRef(
      resolved as Record<string, unknown>,
      resolved as Record<string, unknown>
    );
  }

  return resolved as Record<string, unknown>;
}

// =============================================================================
// Debounce utility (replaces lodash.debounce)
// =============================================================================

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
  options?: { maxWait?: number }
): T & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let maxWaitTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: unknown[] | null = null;

  const cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
    if (maxWaitTimeoutId) clearTimeout(maxWaitTimeoutId);
    timeoutId = null;
    maxWaitTimeoutId = null;
    lastArgs = null;
  };

  const invoke = () => {
    if (lastArgs) {
      fn(...lastArgs);
      lastArgs = null;
    }
    cancel();
  };

  const debounced = ((...args: unknown[]) => {
    lastArgs = args;

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(invoke, delay);

    if (options?.maxWait && !maxWaitTimeoutId) {
      maxWaitTimeoutId = setTimeout(invoke, options.maxWait);
    }
  }) as T & { cancel: () => void };

  debounced.cancel = cancel;
  return debounced;
}
