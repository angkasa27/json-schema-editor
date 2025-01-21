"use client";
import { CodeMirrorJson } from "@/components/ui/code-mirror-json";
import JsonSchemaEditor from "@/json-schema-editor";
import { JSONSchema7 } from "@/json-schema-editor/types";
import { DEFAULT_JSON_SCHEMA } from "@/json-schema-editor/utils";
import { useEffect, useState } from "react";

export default function Home() {
  const [jsonSchema, setJsonSchema] = useState<JSONSchema7>();
  const [stringifyJson, setStringifyJson] = useState<string>();

  useEffect(() => {
    setStringifyJson(
      JSON.stringify(jsonSchema || DEFAULT_JSON_SCHEMA, null, 2)
    );
  }, [jsonSchema]);

  return (
    <div className="p-3">
      <div className="grid grid-cols-5 gap-3">
        <div className="col-span-2">
          <CodeMirrorJson
            value={stringifyJson}
            className="w-full"
            editable={false}
            height="900px"
            onChange={setStringifyJson}
          />
        </div>
        <div className="col-span-3">
          <JsonSchemaEditor
            data={jsonSchema}
            onSchemaChange={(v) => setJsonSchema(v)}
          />
        </div>
      </div>
    </div>
  );
}
