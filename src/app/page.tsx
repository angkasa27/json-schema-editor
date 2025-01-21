"use client";
import JsonSchemaEditor from "@/json-schema-editor";
import { JSONSchema7 } from "@/json-schema-editor/types";
import { useState } from "react";

export default function Home() {
  const [value, setValue] = useState<JSONSchema7>();

  return (
    <div>
      <JsonSchemaEditor data={value} onSchemaChange={(v) => setValue(v)} />
    </div>
  );
}
