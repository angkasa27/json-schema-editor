"use client";

import { useEffect } from "react";
import SchemaItem from "./schema-item";
import { useSchemaStore } from "@/lib/schema/store";
import type { JSONSchema7 } from "@/lib/schema/types";

type JsonSchemaEditorProps = {
  data?: JSONSchema7 | string;
  onSchemaChange?: (schema: JSONSchema7) => void;
};

export default function JsonSchemaEditor({
  data,
  onSchemaChange,
}: JsonSchemaEditorProps) {
  const { schema, initSchema } = useSchemaStore();

  // Initialize schema from props
  useEffect(() => {
    initSchema(data);
  }, [data, initSchema]);

  // Notify parent on schema change
  useEffect(() => {
    onSchemaChange?.(schema);
  }, [schema, onSchemaChange]);

  return (
    <div className="pt-2">
      <SchemaItem schema={schema} />
    </div>
  );
}
