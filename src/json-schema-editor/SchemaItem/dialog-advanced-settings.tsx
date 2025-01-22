import _ from "lodash";
import { useCallback, useEffect, useState } from "react";
// import MonacoEditor from "../MonacoEditor";
import { StringFormat } from "../utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import { JSONSchema7Schema } from "../validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import clsx, { ClassValue } from "clsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputNumber } from "@/components/ui/input-number";
import { Plus, Trash2 } from "lucide-react";

type DialogAdvanceSettingsProps = {
  open: boolean;
  onClose: () => void;
  formSchema: any;
  setFormSchema: (_: any) => void;
  onSubmit: (data: any) => void;
};

export function DialogAdvancedSettings(props: DialogAdvanceSettingsProps) {
  const { open, onClose, formSchema, setFormSchema, onSubmit } = props;
  const [isObject, setIsObject] = useState(false);
  const [isArray, setIsArray] = useState(false);
  const [isNumber, setIsNumber] = useState(false);
  const [isBoolean, setIsBoolean] = useState(false);
  const [isInteger, setIsInteger] = useState(false);
  const [isString, setIsString] = useState(false);

  const form = useForm<z.infer<typeof JSONSchema7Schema>>({
    resolver: zodResolver(JSONSchema7Schema),
    defaultValues: {},
  });

  const handleDebounce = useCallback(
    _.debounce(
      (callback) => {
        if (typeof callback === "function") {
          callback();
        } else {
          console.log("Provided argument is not a function");
        }
      },
      300,
      { maxWait: 1000 }
    ),
    []
  );

  useEffect(() => {
    return () => {
      handleDebounce.cancel();
    };
  }, [handleDebounce]);

  useEffect(() => {
    if (!open || !formSchema) {
      return;
    }
    // advancedForm.setFieldsValue(formSchema);
    form.reset(formSchema);
    setIsObject(formSchema.type === "object");
    setIsArray(formSchema.type === "array");
    setIsNumber(formSchema.type === "number");
    setIsBoolean(formSchema.type === "boolean");
    setIsInteger(formSchema.type === "integer");
    setIsString(formSchema.type === "string");
  }, [open, formSchema]);

  const onTabChanges = (val: string) => {
    if (val === "json") {
      setFormSchema(form.getValues());
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="md:max-w-screen-md">
        <DialogHeader>
          <DialogTitle>Advance Settings</DialogTitle>
        </DialogHeader>
        <Tabs onValueChange={(v) => onTabChanges(v)}>
          <TabsList>
            <TabsTrigger value="form">Basic Settings</TabsTrigger>
            <TabsTrigger value="json">Json Schema</TabsTrigger>
          </TabsList>
          <TabsContent value="form">
            <Form {...form}>
              <form
                id="advanced-settings-form"
                className="grid grid-cols-2 gap-2"
                onSubmit={form.handleSubmit(onSubmit)}
              >
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
                                placeholder={"Input default value"}
                                {...field}
                              />
                            </FormItemWrapper>
                          )}
                          {(isNumber || isInteger) && (
                            <FormItemWrapper label="Default Value">
                              <InputNumber
                                className="w-full"
                                placeholder={"Input default value"}
                                {...field}
                              />
                            </FormItemWrapper>
                          )}
                          {isBoolean && (
                            <FormItemWrapper label="Default Value">
                              <Select
                                {...field}
                                onValueChange={(val) => field.onChange(val)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select default value" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={"true"}>true</SelectItem>
                                  <SelectItem value={"false"}>false</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItemWrapper>
                          )}
                        </>
                      )}
                    />
                  </div>
                )}
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
                              {...field}
                              // parser={(value) =>
                              //   value ? parseInt(value.replace(/\D/g, ""), 10) : ""
                              // }
                              // formatter={(value) =>
                              //   value ? `${Math.floor(Math.max(value, 0))}` : ""
                              // }
                              placeholder={"Input min length"}
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
                              {...field}
                              // parser={(value) =>
                              //   value ? parseInt(value.replace(/\D/g, ""), 10) : ""
                              // }
                              // formatter={(value) =>
                              //   value ? `${Math.floor(Math.max(value, 0))}` : ""
                              // }
                              placeholder={"Input max length"}
                            />
                          </FormItemWrapper>
                        )}
                      />
                    </div>
                  </>
                )}
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
                              placeholder={"Input min value"}
                              {...field}
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
                              placeholder={"Input max value"}
                              {...field}
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
                              placeholder={"Input exclusive min value"}
                              {...field}
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
                              placeholder={"Input exclusive max value"}
                              {...field}
                            />
                          </FormItemWrapper>
                        )}
                      />
                    </div>
                  </>
                )}
                {isString && (
                  <>
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name="pattern"
                        render={({ field }) => (
                          <FormItemWrapper label="Regex Pattern">
                            <Input
                              placeholder={"Input regex pattern"}
                              {...field}
                            />
                          </FormItemWrapper>
                        )}
                      />
                    </div>

                    <div className="col-span-1 flex gap-2">
                      <FormField
                        control={form.control}
                        name="format"
                        render={({ field }) => (
                          <FormItemWrapper label="Format">
                            <Select
                              {...field}
                              onValueChange={(val) => field.onChange(val)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Input Format" />
                              </SelectTrigger>
                              <SelectContent>
                                {StringFormat.map((format) => (
                                  <SelectItem
                                    key={format.value}
                                    value={format.value}
                                  >
                                    {format.value}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {/* <Button
                          size="icon"
                          variant="outline"
                          className="shrink-0"
                        >
                          <X className="size-4" />
                        </Button> */}
                          </FormItemWrapper>
                        )}
                      />
                    </div>
                  </>
                )}
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
                          <FormItemWrapper label="Min Length">
                            <InputNumber
                              className="w-full"
                              // parser={(value) =>
                              //   value ? parseInt(value.replace(/\D/g, ""), 10) : ""
                              // }
                              // formatter={(value) =>
                              //   value ? `${Math.floor(Math.max(value, 0))}` : ""
                              // }
                              placeholder={"Input min length"}
                              {...field}
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
                          <FormItemWrapper label="Max Length">
                            <InputNumber
                              className="w-full"
                              // parser={(value) =>
                              //   value ? parseInt(value.replace(/\D/g, ""), 10) : ""
                              // }
                              // formatter={(value) =>
                              //   value ? `${Math.floor(Math.max(value, 0))}` : ""
                              // }
                              placeholder={"Input max length"}
                              {...field}
                            />
                          </FormItemWrapper>
                        )}
                      />
                    </div>
                  </>
                )}
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
              theme="light"
              height="300px"
              onChange={(value) => {
                handleDebounce(() => {
                  if (value) {
                    try {
                      const editorSchema = JSON.parse(value);
                      setFormSchema(editorSchema);
                    } catch (e) {}
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

{
  /* <FormField
control={form.control}
name="default"
render={({ field }) => (
  <FormItemWrapper>
 
  </FormItemWrapper>
)}
/> */
}

const FieldEnum = ({
  isString,
  isNumber,
  isInteger,
}: {
  isString: boolean;
  isNumber: boolean;
  isInteger: boolean;
}) => {
  const { control } = useFormContext();
  const { fields, remove, append } = useFieldArray({ control, name: "enums" });
  return (
    <div className="space-y-2 col-span-2">
      <FormLabel>Enums</FormLabel>
      <div className="col-span-2 grid grid-cols-2 gap-2 mb-2">
        {fields.map((field, index) => (
          <div className="flex gap-2" key={field.id}>
            <FormField
              control={control}
              name={`enums.${index}`}
              render={({ field }) => (
                <>
                  {isString && (
                    <FormItemWrapper>
                      <Input
                        className="w-full"
                        placeholder={"Input enum value"}
                        {...field}
                      />
                    </FormItemWrapper>
                  )}
                  {(isNumber || isInteger) && (
                    <FormItemWrapper>
                      <InputNumber
                        className="w-full"
                        placeholder={"Input enum value"}
                        {...field}
                      />
                    </FormItemWrapper>
                  )}
                </>
              )}
            />
            <Button
              size="icon"
              color="destructive"
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
              append(isString ? "New value" : isNumber ? fields.length : false)
            }
            type="button"
          >
            <Plus className="size-4" />
            Add enum
          </Button>
        </div>
      </div>
    </div>
  );
};

const FormItemWrapper = ({
  children,
  className,
  label,
}: {
  label?: string;
  children: React.ReactNode;
  className?: ClassValue;
}) => (
  <FormItem className={clsx("w-full", className)}>
    {!!label?.length && <FormLabel>{label}</FormLabel>}
    <FormControl>{children}</FormControl>
    <FormMessage />
  </FormItem>
);
