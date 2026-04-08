"use client";

import { useCallback, useEffect, useState } from "react";
import { STRING_FORMATS, debounce } from "@/lib/schema/utils";
import { JSONSchema7Schema } from "@/lib/schema/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { InputNumber } from "@/components/ui/input-number";
import { useFieldArray, useForm, useFormContext } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CodeMirrorJson } from "@/components/ui/code-mirror-json";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// Types
// =============================================================================

type DialogAdvancedSettingsProps = {
  open: boolean;
  onClose: () => void;
  schema: import("@/lib/schema/types").JSONSchema7;
  onSubmit: (data: Record<string, unknown>) => void;
};

// =============================================================================
// Component
// =============================================================================

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleDebounce = useCallback(
    debounce(
      (callback: unknown) => {
        if (typeof callback === "function") callback();
      },
      300,
      { maxWait: 1000 }
    ),
    []
  );

  useEffect(() => {
    return () => handleDebounce.cancel();
  }, [handleDebounce]);

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
                {/* General metadata */}
                <div className="col-span-2 space-y-4 mb-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItemWrapper label="Title">
                        <Input
                          className="w-full"
                          placeholder="Enter field title"
                          disabled={field.disabled}
                          name={field.name}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          ref={field.ref}
                          value={(field.value as string) || ""}
                        />
                      </FormItemWrapper>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItemWrapper label="Description">
                        <Textarea
                          className="w-full resize-none"
                          rows={3}
                          placeholder="Enter field description"
                          disabled={field.disabled}
                          name={field.name}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          ref={field.ref}
                          value={(field.value as string) || ""}
                        />
                      </FormItemWrapper>
                    )}
                  />
                </div>

                {/* Default value */}
                {(isString || isNumber || isInteger || isBoolean) && (
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="default"
                      render={({ field }) => (
                        <>
                          {isString && (
                            <FormItemWrapper label="Default Value">
                              <Input
                                className="w-full"
                                placeholder="Enter default value"
                                name={field.name}
                                onBlur={field.onBlur}
                                onChange={field.onChange}
                                ref={field.ref}
                                disabled={field.disabled}
                                value={(field.value ?? "") as string | number | readonly string[]}
                              />
                            </FormItemWrapper>
                          )}
                          {(isNumber || isInteger) && (
                            <FormItemWrapper label="Default Value">
                              <InputNumber
                                className="w-full"
                                placeholder="Enter default value"
                                value={field.value as number}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                ref={field.ref}
                              />
                            </FormItemWrapper>
                          )}
                          {isBoolean && (
                            <FormItemWrapper label="Default Value">
                              <Select
                                value={String(field.value ?? "")}
                                onValueChange={(val) => field.onChange(val)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select default value" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="true">true</SelectItem>
                                  <SelectItem value="false">false</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItemWrapper>
                          )}
                        </>
                      )}
                    />
                  </div>
                )}

                {/* String-specific fields */}
                {isString && (
                  <>
                    <div className="col-span-1">
                      <FormField
                        control={form.control}
                        name="minLength"
                        render={({ field }) => (
                          <FormItemWrapper label="Min Length">
                            <InputNumber
                              min={0}
                              className="w-full"
                              placeholder="Min length"
                              value={field.value as number}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              ref={field.ref}
                            />
                          </FormItemWrapper>
                        )}
                      />
                    </div>
                    <div className="col-span-1">
                      <FormField
                        control={form.control}
                        name="maxLength"
                        render={({ field }) => (
                          <FormItemWrapper label="Max Length">
                            <InputNumber
                              min={0}
                              className="w-full"
                              placeholder="Max length"
                              value={field.value as number}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              ref={field.ref}
                            />
                          </FormItemWrapper>
                        )}
                      />
                    </div>
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name="pattern"
                        render={({ field }) => (
                          <FormItemWrapper label="Regex Pattern">
                            <Input placeholder="Regex pattern" {...field} />
                          </FormItemWrapper>
                        )}
                      />
                    </div>
                    <div className="col-span-1">
                      <FormField
                        control={form.control}
                        name="format"
                        render={({ field }) => (
                          <FormItemWrapper label="Format">
                            <Select
                              value={field.value as string}
                              onValueChange={(val) => field.onChange(val)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select format" />
                              </SelectTrigger>
                              <SelectContent>
                                {STRING_FORMATS.map((f) => (
                                  <SelectItem key={f.value} value={f.value}>
                                    {f.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItemWrapper>
                        )}
                      />
                    </div>
                  </>
                )}

                {/* Number/Integer fields */}
                {(isNumber || isInteger) && (
                  <>
                    <div className="col-span-1">
                      <FormField
                        control={form.control}
                        name="minimum"
                        render={({ field }) => (
                          <FormItemWrapper label="Min Value">
                            <InputNumber
                              className="w-full"
                              placeholder="Min value"
                              value={field.value as number}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              ref={field.ref}
                            />
                          </FormItemWrapper>
                        )}
                      />
                    </div>
                    <div className="col-span-1">
                      <FormField
                        control={form.control}
                        name="maximum"
                        render={({ field }) => (
                          <FormItemWrapper label="Max Value">
                            <InputNumber
                              className="w-full"
                              placeholder="Max value"
                              value={field.value as number}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              ref={field.ref}
                            />
                          </FormItemWrapper>
                        )}
                      />
                    </div>
                    <div className="col-span-1">
                      <FormField
                        control={form.control}
                        name="exclusiveMinimum"
                        render={({ field }) => (
                          <FormItemWrapper label="Exclusive Min">
                            <InputNumber
                              className="w-full"
                              placeholder="Exclusive min"
                              value={field.value as number}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              ref={field.ref}
                            />
                          </FormItemWrapper>
                        )}
                      />
                    </div>
                    <div className="col-span-1">
                      <FormField
                        control={form.control}
                        name="exclusiveMaximum"
                        render={({ field }) => (
                          <FormItemWrapper label="Exclusive Max">
                            <InputNumber
                              className="w-full"
                              placeholder="Exclusive max"
                              value={field.value as number}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              ref={field.ref}
                            />
                          </FormItemWrapper>
                        )}
                      />
                    </div>
                  </>
                )}

                {/* Array fields */}
                {isArray && (
                  <>
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name="uniqueItems"
                        render={({ field }) => (
                          <FormItemWrapper label="Unique Items">
                            <Switch
                              ref={field.ref}
                              onBlur={field.onBlur}
                              disabled={field.disabled}
                              checked={!!field.value}
                              onCheckedChange={(val) => field.onChange(val)}
                            />
                          </FormItemWrapper>
                        )}
                      />
                    </div>
                    <div className="col-span-1">
                      <FormField
                        control={form.control}
                        name="minItems"
                        render={({ field }) => (
                          <FormItemWrapper label="Min Items">
                            <InputNumber
                              className="w-full"
                              placeholder="Min items"
                              value={field.value as number}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              ref={field.ref}
                            />
                          </FormItemWrapper>
                        )}
                      />
                    </div>
                    <div className="col-span-1">
                      <FormField
                        control={form.control}
                        name="maxItems"
                        render={({ field }) => (
                          <FormItemWrapper label="Max Items">
                            <InputNumber
                              className="w-full"
                              placeholder="Max items"
                              value={field.value as number}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              ref={field.ref}
                            />
                          </FormItemWrapper>
                        )}
                      />
                    </div>
                  </>
                )}

                {/* Enum fields */}
                {(isString || isNumber || isInteger) && (
                  <FieldEnum
                    isString={isString}
                    isNumber={isNumber}
                    isInteger={isInteger}
                  />
                )}
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="json">
            <CodeMirrorJson
              className="col-span-6"
              value={JSON.stringify(formSchema || {}, null, 2)}
              editable
              height="300px"
              onChange={(value) => {
                handleDebounce(() => {
                  if (value) {
                    try {
                      setFormSchema(JSON.parse(value));
                    } catch {
                      // ignore JSON parse errors while typing
                    }
                  }
                });
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

// =============================================================================
// Sub-components
// =============================================================================

function FieldEnum({
  isString,
  isNumber,
  isInteger,
}: {
  isString: boolean;
  isNumber: boolean;
  isInteger: boolean;
}) {
  const { control } = useFormContext();
  const { fields, remove, append } = useFieldArray({ control, name: "enum" });

  return (
    <div className="space-y-2 col-span-2">
      <FormLabel>Enum Values</FormLabel>
      <div className="col-span-2 grid grid-cols-2 gap-2 mb-2">
        {fields.map((field, index) => (
          <div className="flex gap-2" key={field.id}>
            <FormField
              control={control}
              name={`enum.${index}`}
              render={({ field }) => (
                <>
                  {isString && (
                    <FormItemWrapper>
                      <Input
                        className="w-full"
                        placeholder="Enum value"
                        {...field}
                      />
                    </FormItemWrapper>
                  )}
                  {(isNumber || isInteger) && (
                    <FormItemWrapper>
                      <InputNumber
                        className="w-full"
                        placeholder="Enum value"
                        value={field.value as number}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
                    </FormItemWrapper>
                  )}
                </>
              )}
            />
            <Button
              size="icon"
              variant="destructive"
              onClick={() => remove(index)}
              className="shrink-0"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <div className="col-span-2">
          <Button
            onClick={() =>
              append(
                isString ? "New value" : isNumber ? fields.length : false
              )
            }
            type="button"
            variant="outline"
          >
            <Plus className="size-4" />
            Add Enum
          </Button>
        </div>
      </div>
    </div>
  );
}

function FormItemWrapper({
  children,
  className,
  label,
}: {
  label?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <FormItem className={cn("w-full", className)}>
      {label && <FormLabel>{label}</FormLabel>}
      <FormControl>{children}</FormControl>
      <FormMessage />
    </FormItem>
  );
}
