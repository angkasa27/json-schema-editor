"use client";

import { useState } from "react";
import { parseJsonStr, resolveJsonSchemaRef } from "@/lib/schema/utils";
import type { JSONSchema7 } from "@/lib/schema/types";
import { Button } from "@/components/ui/button";
import { ClipboardPaste } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeMirrorJson } from "@/components/ui/code-mirror-json";

type DialogImportProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (schema: JSONSchema7) => void;
};

export function DialogImport({ open, onClose, onSubmit }: DialogImportProps) {
  const [importType, setImportType] = useState<"json" | "json-schema">("json");
  const [importValue, setImportValue] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    if (!importValue || importValue.length === 0) {
      toast.error("JSON value empty", {
        description: "Please input a JSON value",
      });
      return;
    }

    const importObject = parseJsonStr(importValue);
    if (!importObject) {
      toast.error("JSON format is invalid", {
        description: "Please input valid JSON",
      });
      return;
    }

    setLoading(true);
    try {
      let schema: JSONSchema7;
      if (importType === "json") {
        // Infer schema from JSON data
        const { inferSchema } = await import("@/lib/schema/utils");
        schema = inferSchema(importObject);
      } else {
        // Resolve $refs in existing JSON Schema
        schema = (await resolveJsonSchemaRef(importObject)) as JSONSchema7;
      }
      onSubmit(schema);
      setImportValue(undefined);
    } catch (err) {
      toast.error("Failed to process schema", {
        description:
          err instanceof Error ? err.message : "Unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="md:max-w-screen-md">
        <DialogHeader>
          <DialogTitle>Import</DialogTitle>
        </DialogHeader>

        <div className="flex justify-between items-center">
          <Tabs
            value={importType}
            onValueChange={(type) =>
              setImportType(type as "json" | "json-schema")
            }
          >
            <TabsList>
              <TabsTrigger value="json">JSON Data</TabsTrigger>
              <TabsTrigger value="json-schema">JSON Schema</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              try {
                const text = await navigator.clipboard.readText();
                setImportValue(text);
                toast.success("Pasted from clipboard");
              } catch (err) {
                toast.error("Failed to read from clipboard");
              }
            }}
          >
            <ClipboardPaste className="size-4 mr-1.5" />
            Paste
          </Button>
        </div>

        <CodeMirrorJson
          className="w-full"
          value={importValue}
          editable
          height="300px"
          onChange={(value) => setImportValue(value)}
        />

        <DialogFooter>
          <Button onClick={handleImport} disabled={loading}>
            {loading ? "Importing..." : "Import"}
          </Button>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
