"use client";

import { useMemo, useState, useCallback } from "react";
import { CodeMirrorJson } from "@/components/ui/code-mirror-json";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import JsonSchemaEditor from "@/components/schema-editor";
import { DEFAULT_JSON_SCHEMA } from "@/lib/schema/utils";
import type { JSONSchema7 } from "@/lib/schema/types";
import { DialogImport } from "@/components/schema-editor/dialog-import";
import { DialogValidate } from "@/components/schema-editor/dialog-validate";
import { Button } from "@/components/ui/button";
import { FileJson2, Copy, Check, Braces, Download, Play } from "lucide-react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SCHEMA_SAMPLES } from "@/lib/schema/samples";

export type DraftVersion = "draft-07" | "draft-2019-09" | "draft-2020-12";

const DRAFT_URIS: Record<DraftVersion, string> = {
  "draft-07": "http://json-schema.org/draft-07/schema#",
  "draft-2019-09": "https://json-schema.org/draft/2019-09/schema",
  "draft-2020-12": "https://json-schema.org/draft/2020-12/schema",
};

export default function Home() {
  const [draftVersion, setDraftVersion] = useState<DraftVersion>("draft-07");
  const [jsonSchema, setJsonSchema] =
    useState<JSONSchema7>(DEFAULT_JSON_SCHEMA);

  const stringifyJson = useMemo(() => {
    const finalSchema = { ...jsonSchema } as Partial<JSONSchema7>;
    // Move $schema to top organically
    const $schema = DRAFT_URIS[draftVersion];
    const schemaWithDraft = { $schema, ...finalSchema };
    return JSON.stringify(schemaWithDraft, null, 2);
  }, [jsonSchema, draftVersion]);

  const [importModal, setImportModal] = useState(false);
  const [validateModal, setValidateModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(stringifyJson);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }, [stringifyJson]);

  const handleExport = useCallback(() => {
    try {
      const blob = new Blob([stringifyJson], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "schema.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Schema exported");
    } catch {
      toast.error("Failed to export schema");
    }
  }, [stringifyJson]);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4 lg:px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Braces className="size-5 text-primary" />
            <h1 className="text-lg font-semibold tracking-tight">
              JSON Schema Editor
            </h1>
          </div>
          <div className="flex items-center gap-2 mr-4">
            <Select
              value={draftVersion}
              onValueChange={(v) => setDraftVersion(v as DraftVersion)}
            >
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="Select Draft" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft-07">Draft 07</SelectItem>
                <SelectItem value="draft-2019-09">Draft 2019-09</SelectItem>
                <SelectItem value="draft-2020-12">Draft 2020-12</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const sample = SCHEMA_SAMPLES[draftVersion];
              if (sample) {
                setJsonSchema(sample as JSONSchema7);
                toast.success(`Loaded ${draftVersion} sample`);
              }
            }}
          >
            <span className="hidden sm:inline">Load Sample</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setValidateModal(true)}
          >
            <Play className="size-4" />
            <span className="hidden sm:inline">Validate</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportModal(true)}
          >
            <FileJson2 className="size-4" />
            <span className="hidden sm:inline">Import</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="size-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <Check className="size-4 text-green-500" />
            ) : (
              <Copy className="size-4" />
            )}
            <span className="hidden sm:inline">
              {copied ? "Copied" : "Copy"}
            </span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {/* Desktop: Resizable panels */}
        <div className="hidden md:block h-full">
          <ResizablePanelGroup orientation="horizontal">
            <ResizablePanel minSize={20} defaultSize={35}>
              <div className="h-full flex flex-col">
                <div className="px-3 py-2 border-b bg-muted/50">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                    JSON Output
                  </p>
                </div>
                <div className="flex-1 overflow-auto">
                  <CodeMirrorJson
                    value={stringifyJson}
                    className="w-full border-none h-full [&_.cm-editor]:h-full"
                    editable={false}
                    height="100%"
                  />
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel minSize={50} defaultSize={65}>
              <div className="h-full flex flex-col">
                <div className="px-3 py-2 border-b bg-muted/50">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                    Schema Editor
                  </p>
                </div>
                <div className="flex-1 overflow-auto p-3">
                  <JsonSchemaEditor
                    data={jsonSchema}
                    onSchemaChange={(v) => setJsonSchema(v)}
                  />
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Mobile: Stacked layout */}
        <div className="md:hidden h-full flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-3">
            <div className="px-2 py-1.5 mb-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                Schema Editor
              </p>
            </div>
            <JsonSchemaEditor
              data={jsonSchema}
              onSchemaChange={(v) => setJsonSchema(v)}
            />
          </div>
          <div className="border-t h-[200px] shrink-0">
            <div className="px-3 py-2 border-b bg-muted/50">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                JSON Output
              </p>
            </div>
            <CodeMirrorJson
              value={stringifyJson}
              className="w-full border-none"
              editable={false}
              height="160px"
            />
          </div>
        </div>
      </main>

      {/* Import Dialog */}
      {importModal && (
        <DialogImport
          open
          onClose={() => setImportModal(false)}
          onSubmit={(schema) => {
            setJsonSchema(schema);
            setImportModal(false);
          }}
        />
      )}

      {/* Validate Dialog */}
      {validateModal && (
        <DialogValidate
          open
          onClose={() => setValidateModal(false)}
          schema={jsonSchema}
          draftVersion={draftVersion}
        />
      )}
    </div>
  );
}
