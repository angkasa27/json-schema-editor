import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { JSONSchema7Schema } from "@/lib/schema/validation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicSettingsTab } from "./basic-settings-tab";
import { JsonPreviewTab } from "./json-preview-tab";

type DialogAdvancedSettingsProps = {
  open: boolean;
  onClose: () => void;
  schema: import("@/lib/schema/types").JSONSchema7;
  onSubmit: (data: Record<string, unknown>) => void;
};

export function DialogAdvancedSettings({
  open,
  onClose,
  schema,
  onSubmit,
}: DialogAdvancedSettingsProps) {
  const [formSchema, setFormSchema] = useState<Record<string, unknown>>();

  const schemaType = schema?.type as string;
  const isArray = schemaType === "array";
  const isNumber = schemaType === "number";
  const isBoolean = schemaType === "boolean";
  const isInteger = schemaType === "integer";
  const isString = schemaType === "string";

  const form = useForm<import("@/lib/schema/types").JSONSchema7>({
    // @ts-expect-error - ZodResolver mismatch
    resolver: zodResolver(JSONSchema7Schema),
    defaultValues: {},
  });

  useEffect(() => {
    if (!open || !schema) return;
    form.reset(schema as Record<string, unknown>);
  }, [open, schema, form]);

  const onTabChanges = (val: string) => {
    if (val === "json") {
      setFormSchema(form.getValues() as Record<string, unknown>);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="md:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced Settings</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="form" onValueChange={onTabChanges}>
          <TabsList>
            <TabsTrigger value="form">Basic Settings</TabsTrigger>
            <TabsTrigger value="json">JSON Schema</TabsTrigger>
          </TabsList>
          <TabsContent value="form">
            <Form {...form}>
              <form
                id="advanced-settings-form"
                className="grid grid-cols-2 gap-3"
                onSubmit={form.handleSubmit((data) =>
                  onSubmit(data as Record<string, unknown>)
                )}
              >
                <BasicSettingsTab
                  isString={isString}
                  isArray={isArray}
                  isBoolean={isBoolean}
                  isInteger={isInteger}
                  isNumber={isNumber}
                />
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="json">
            <JsonPreviewTab
              formSchema={formSchema}
              setFormSchema={(newSchema) => {
                setFormSchema(newSchema);
                // Also update form if needed? 
                form.reset(newSchema);
              }}
            />
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button type="submit" form="advanced-settings-form">
            Save
          </Button>
          <Button type="button" variant="outline" onClick={() => onClose()}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
