import { create } from "zustand";
import type { JSONSchema7 } from "./types";
import { DEFAULT_JSON_SCHEMA, getDefaultSchema, inferSchema } from "./utils";

// =============================================================================
// Store Types
// =============================================================================

interface SchemaEditorState {
  schema: JSONSchema7;
  fieldCount: number;

  // Actions
  setSchema: (schema: JSONSchema7) => void;
  initSchema: (data: JSONSchema7 | string | undefined) => void;
  changeSchema: (
    namePath: number[],
    value: unknown,
    propertyName?: string
  ) => void;
  renameProperty: (path: number[], newKey: string) => boolean;
  removeProperty: (path: number[]) => void;
  addProperty: (namePath: number[], isChild: boolean) => void;
  updateRequiredProperty: (
    path: number[],
    requiredProperty: string,
    removed: boolean
  ) => void;
}

// =============================================================================
// Internal helpers
// =============================================================================

function updateRequired(
  target: Record<string, unknown>,
  property: string,
  remove: boolean
) {
  if (!target.required) {
    target.required = [];
  }
  const required = target.required as string[];
  const index = required.indexOf(property);

  if (remove) {
    if (index !== -1) required.splice(index, 1);
  } else {
    if (index === -1) required.push(property);
  }

  if (required.length === 0) {
    delete target.required;
  }
}

// =============================================================================
// Zustand Store
// =============================================================================

export const useSchemaStore = create<SchemaEditorState>((set, get) => ({
  schema: DEFAULT_JSON_SCHEMA,
  fieldCount: 0,

  setSchema: (schema) => set({ schema }),

  initSchema: (data) => {
    if (!data) {
      set({ schema: DEFAULT_JSON_SCHEMA });
      return;
    }

    if (typeof data === "string") {
      try {
        set({ schema: inferSchema(JSON.parse(data)) });
      } catch {
        set({ schema: DEFAULT_JSON_SCHEMA });
      }
      return;
    }

    set({ schema: data });
  },

  changeSchema: (namePath, value, propertyName) => {
    const { schema } = get();

    if (namePath.length === 0) {
      set({ schema: value as JSONSchema7 });
      return;
    }

    const clone = structuredClone(schema);
    let current = clone as Record<string, unknown>;

    for (let i = 0; i < namePath.length - 1; i++) {
      const key = Object.keys(current)[namePath[i]];
      if (!current[key]) current[key] = {};
      current = current[key] as Record<string, unknown>;
    }

    const lastKey = namePath[namePath.length - 1];
    const lastKeyActual = Object.keys(current)[lastKey];

    if (lastKey === -1) {
      if (typeof value === "undefined" || !propertyName) return;
      current[propertyName] = value;
    } else {
      if (current[lastKeyActual] === value) return;
      current[lastKeyActual] = value;
    }

    set({ schema: clone });
  },

  renameProperty: (path, newKey) => {
    const { schema } = get();
    const clone = structuredClone(schema);
    let current = clone as Record<string, unknown>;
    let parent: Record<string, unknown> | null = null;
    let parentKey: string = "";

    for (let i = 0; i < path.length - 1; i++) {
      const keys = Object.keys(current);
      const index =
        typeof path[i] === "number"
          ? path[i]
          : keys.indexOf(String(path[i]));

      if (index < 0 || index >= keys.length) return false;

      parent = current;
      parentKey = keys[index];
      current = current[parentKey] as Record<string, unknown>;
    }

    const oldKeyIndex = path[path.length - 1];
    const keys = Object.keys(current);
    const oldKey = keys[oldKeyIndex];

    if (oldKey === newKey) return true;

    if (Object.prototype.hasOwnProperty.call(current, newKey)) {
      return false;
    }

    if (Object.prototype.hasOwnProperty.call(current, oldKey) && parent !== null) {
      parent[parentKey] = Object.fromEntries(
        Object.entries(current).map(([key, value]) =>
          key === oldKey ? [newKey, value] : [key, value]
        )
      );
    }

    set({ schema: clone });
    return true;
  },

  removeProperty: (path) => {
    const { schema } = get();
    const clone = structuredClone(schema);
    let current = clone as Record<string, unknown> | undefined | null;
    let pre = clone as Record<string, unknown>;

    for (let i = 0; i < path.length - 1; i++) {
      if (current !== undefined && current !== null) {
        pre = current;
        current = current[Object.keys(current)[path[i]]] as typeof current;
      } else {
        return;
      }
    }

    if (!current) return;
    const finalKey = Object.keys(current)[path[path.length - 1]];
    updateRequired(pre, finalKey, true);

    if (
      current &&
      typeof current === "object" &&
      Object.prototype.hasOwnProperty.call(current, finalKey)
    ) {
      delete current[finalKey];
    }

    set({ schema: clone });
  },

  addProperty: (namePath, isChild) => {
    const { schema, fieldCount } = get();
    const clone = structuredClone(schema);
    let current = clone as Record<string, unknown>;

    for (let i = 0; i < namePath.length - (isChild ? 0 : 1); i++) {
      const key = Object.keys(current)[namePath[i]];
      if (!current[key]) current[key] = {};
      current = current[key] as Record<string, unknown>;
    }

    const newSchema = getDefaultSchema("string");

    if (isChild) {
      if (!current["properties"]) current["properties"] = {};
      (current["properties"] as Record<string, unknown>)[`field_${fieldCount}`] = newSchema;
    } else {
      current[`field_${fieldCount}`] = newSchema;
    }

    set({ schema: clone, fieldCount: fieldCount + 1 });
  },

  updateRequiredProperty: (path, requiredProperty, removed) => {
    const { schema } = get();
    const clone = structuredClone(schema);
    let current = clone as Record<string, unknown>;

    for (let i = 0; i < path.length; i++) {
      const index = path[i];
      const keys = Object.keys(current);
      if (typeof current[keys[index]] === "undefined") {
        current[keys[index]] = {};
      }
      current = current[keys[index]] as Record<string, unknown>;
    }

    updateRequired(current, requiredProperty, removed);
    set({ schema: clone });
  },
}));
