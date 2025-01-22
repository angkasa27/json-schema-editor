"use client";
import { CodeMirrorJson } from "@/components/ui/code-mirror-json";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
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
      <ResizablePanelGroup direction="horizontal" className="border rounded-md">
        <ResizablePanel minSize={20} defaultSize={30}>
          <CodeMirrorJson
            value={stringifyJson}
            className="w-full border-none"
            editable={false}
            height="900px"
            onChange={setStringifyJson}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel className="p-3" minSize={50}>
          <JsonSchemaEditor
            data={jsonSchema}
            onSchemaChange={(v) => setJsonSchema(v)}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
