"use client";

import { useState, useEffect, useCallback } from "react";
import Ajv from "ajv";
import { parseJsonStr } from "@/lib/schema/utils";
import type { JSONSchema7 } from "@/lib/schema/types";
import { Button } from "@/components/ui/button";
import { ClipboardPaste, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CodeMirrorJson } from "@/components/ui/code-mirror-json";

type DialogValidateProps = {
  open: boolean;
  onClose: () => void;
  schema: JSONSchema7;
};

// Interface for validation errors from json-schema-library
interface JsonSchemaError {
  type: string;
  name: string;
  code: string;
  message: string;
  data?: unknown;
}

export function DialogValidate({ open, onClose, schema }: DialogValidateProps) {
  const [dataValue, setDataValue] = useState<string | undefined>('{\n  \n}');
  const [validationResult, setValidationResult] = useState<{
    status: "idle" | "success" | "error";
    errors: JsonSchemaError[];
  }>({ status: "idle", errors: [] });

  const handleValidate = useCallback(() => {
    if (!dataValue || dataValue.trim() === "") {
      setValidationResult({ status: "idle", errors: [] });
      return;
    }

    const dataObject = parseJsonStr(dataValue);
    if (!dataObject && dataValue.trim() !== "") {
      setValidationResult({
        status: "error",
        errors: [
          {
            type: "ParseError",
            name: "SyntaxError",
            code: "invalid-json",
            message: "Invalid JSON format. Please check your syntax.",
          },
        ],
      });
      return;
    }

    try {
        // Build the validation schema
        const ajv = new Ajv({ allErrors: true });
        const validate = ajv.compile(schema as Record<string, unknown>);
        const valid = validate(dataObject);

        if (valid) {
            setValidationResult({ status: "success", errors: [] });
        } else {
            const errors = (validate.errors || []).map((err) => ({
                type: "ValidationError",
                name: "Error",
                code: err.keyword,
                message: `${err.instancePath || "root"} ${err.message}`,
            }));
            setValidationResult({ status: "error", errors });
        }
    } catch (err: unknown) {
        setValidationResult({
            status: "error",
            errors: [
              {
                type: "ValidationError",
                name: "Error",
                code: "validation-error",
                message: err instanceof Error ? err.message : "An unexpected validation error occurred",
              },
            ],
          });
    }
  }, [dataValue, schema]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleValidate();
    }, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [handleValidate]);

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="md:max-w-3xl flex flex-col h-[80vh]">
        <DialogHeader>
          <DialogTitle>Validate JSON Data</DialogTitle>
        </DialogHeader>

        <div className="flex justify-between items-end">
         <p className="text-sm text-muted-foreground">
             Paste or write your JSON data below to validate it against the current schema.
         </p>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                const text = await navigator.clipboard.readText();
                setDataValue(text);
                toast.success("Pasted from clipboard");
                setValidationResult({ status: "idle", errors: [] });
              } catch {
                toast.error("Failed to read from clipboard");
              }
            }}
          >
            <ClipboardPaste className="size-4 mr-1.5" />
            Paste
          </Button>
        </div>

        <div className="flex-1 min-h-0 border rounded-md overflow-hidden flex flex-col">
            <CodeMirrorJson
            className="w-full h-full flex-1"
            value={dataValue}
            editable
            height="100%"
            onChange={(value) => {
                setDataValue(value);
                setValidationResult({ status: "idle", errors: [] });
            }}
            />
        </div>

        {/* Validation Results Area */}
        <div className="h-40 shrink-0 border rounded-md overflow-y-auto bg-muted/30 p-4">
            {validationResult.status === "idle" && (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                    Start typing your JSON data...
                </div>
            )}
            {validationResult.status === "success" && (
                <div className="h-full flex flex-col items-center justify-center text-green-600 gap-2">
                    <CheckCircle2 className="size-8" />
                    <p className="font-medium">JSON Data is valid!</p>
                </div>
            )}
            {validationResult.status === "error" && (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-red-500 font-medium pb-2 border-b">
                        <XCircle className="size-5" />
                        <p>Found {validationResult.errors.length} validation error(s):</p>
                    </div>
                    <ul className="text-sm space-y-2 font-mono mt-2">
                        {validationResult.errors.map((err, idx) => (
                            <li key={idx} className="text-red-500">
                                <span>- </span>
                                {err.message}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>

        <DialogFooter className="mt-2 shrink-0">
          <Button onClick={onClose} variant="ghost">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
