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
import { Button, buttonVariants } from "@/components/ui/button";
import {
  FileJson2,
  Copy,
  Check,
  Braces,
  Download,
  Play,
  ArrowUpFromLine,
} from "lucide-react";
import { toast } from "sonner";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.45-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
  </svg>
);

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
      <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4 lg:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-2">
            <Braces className="size-5 text-primary" />
            <h1 className="text-base sm:text-lg font-semibold tracking-tight">
              JSON Schema Editor
            </h1>
          </div>
          <div className="flex items-center">
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
        <div className="flex flex-wrap items-center gap-2">
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
            <ArrowUpFromLine className="size-4" />
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
          <a
            href="https://github.com/angkasa27/json-schema-editor"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "default", size: "sm" })}
          >
            <GithubIcon className="size-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
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

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-2 px-4 shrink-0 flex items-center justify-center text-xs text-muted-foreground">
        <p>
          Created by
          <a
            href="https://asaa.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 font-medium hover:text-foreground hover:underline transition-colors"
          >
            Dimas Angkasa
          </a>
        </p>
      </footer>

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
