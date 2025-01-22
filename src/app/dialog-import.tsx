import { Draft07 } from "json-schema-library";
import _ from "lodash";
import { parseJsonStr, resolveJsonSchemaRef } from "@/json-schema-editor/utils";
import { Button } from "@/components/ui/button";
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
import { useState } from "react";
import { JSONSchema7 } from "@/json-schema-editor/types";

type DialogImportProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (schema: JSONSchema7) => void;
};

export function DialogImport(props: DialogImportProps) {
  const { open, onClose, onSubmit } = props;
  const [importType, setImportType] = useState<"json" | "json-schema">("json");
  const [importValue, setImportValue] = useState<string | undefined>();

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="md:max-w-screen-md">
        <DialogHeader>
          <DialogTitle>Import</DialogTitle>
        </DialogHeader>

        <Tabs
          value={importType}
          onValueChange={(type) =>
            setImportType(type as "json" | "json-schema")
          }
        >
          <TabsList>
            <TabsTrigger value="json">Json</TabsTrigger>
            <TabsTrigger value="json-schema">Json Schema</TabsTrigger>
          </TabsList>
        </Tabs>
        <div>
          <CodeMirrorJson
            className="w-full"
            editable
            theme="dark"
            height="300px"
            onChange={(value) => setImportValue(value)}
          />
        </div>
        <DialogFooter>
          <Button
            onClick={async () => {
              if (!importValue || importValue.length === 0) {
                toast.error("Json value empty", {
                  description: "Please input json value",
                });
                return;
              }
              const importObject = parseJsonStr(importValue);
              if (!importObject) {
                toast.error("Json format is invalid", {
                  description: "Please input valid json",
                });
                return;
              }
              let schema;
              switch (importType) {
                case "json":
                  schema = new Draft07().createSchemaOf(importObject);
                  break;
                case "json-schema":
                  schema = await resolveJsonSchemaRef(importObject);
                  break;
              }
              onSubmit(schema);
              setImportValue(undefined);
            }}
          >
            Import
          </Button>
          <Button onClick={() => onClose()} variant="outline">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
