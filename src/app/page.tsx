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
import { Button } from "@/components/ui/button";
import { FileJson2, Copy, Check, Braces, Download } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [jsonSchema, setJsonSchema] =
    useState<JSONSchema7>(DEFAULT_JSON_SCHEMA);
  const stringifyJson = useMemo(
    () => JSON.stringify(jsonSchema || DEFAULT_JSON_SCHEMA, null, 2),
    [jsonSchema]
  );

  const [importModal, setImportModal] = useState(false);
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
          <Badge variant="secondary" className="text-xs font-mono">
            Draft-07
          </Badge>
        </div>
        <div className="flex items-center gap-2">
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
    </div>
  );
}
