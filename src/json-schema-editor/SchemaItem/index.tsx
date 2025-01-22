import { Form } from "antd";
import { Draft07 } from "json-schema-library";
import _ from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
// import MonacoEditor from "../MonacoEditor";
import { JSONSchema7, JSONSchema7TypeName } from "../types";
import {
  getDefaultSchema,
  getPropertyIndex,
  parseJsonStr,
  resolveJsonSchemaRef,
  SchemaTypeOptions,
  SchemaTypes,
  StringFormat,
} from "../utils";
import {
  ChevronDown,
  ChevronRight,
  FileJson2,
  Plus,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeMirrorJson } from "@/components/ui/code-mirror-json";

type SchemaItemProps = {
  propertyName?: string;
  nodeDepth?: number;
  parentSchemaDepth?: number;
  namePath?: number[];
  isArrayItems?: boolean;
  isRequire?: boolean;
  schema: JSONSchema7;
  changeSchema?: (
    namePath: number[],
    value: any,
    propertyName?: string
  ) => void;
  renameProperty?: (namePath: number[], name: string) => void;
  removeProperty?: (namePath: number[]) => void;
  addProperty?: (path: number[], isChild: boolean) => void;
  updateRequiredProperty?: (
    path: number[],
    requiredProperty: string,
    removed: boolean
  ) => void;
  handleAdvancedSettingClick?: (
    namePath: number[],
    schema: JSONSchema7,
    propertyName?: string
  ) => boolean;
};

function SchemaItem(props: SchemaItemProps) {
  const [advancedForm] = Form.useForm();
  const {
    changeSchema,
    renameProperty,
    isArrayItems,
    updateRequiredProperty,
    parentSchemaDepth = 0,
    removeProperty,
    addProperty,
    isRequire,
    handleAdvancedSettingClick,
  } = props;

  const [schema, setSchema] = useState(props.schema);
  const [formSchema, setFormSchema] = useState<any>();
  const [propertyName, setPropertyName] = useState(props.propertyName);
  const [schemaTitle, setSchemaTitle] = useState(schema.title);
  const [schemaDescription, setSchemaDescription] = useState(
    schema.description
  );
  const [nodeDepth, setNodeDepth] = useState(
    props.nodeDepth ? props.nodeDepth : 0
  );
  const [namePath, setNamePath] = useState<number[]>(
    props.namePath ? props.namePath : []
  );
  const [expand, setExpand] = useState(true);
  const [advancedModal, setAdvancedModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [importType, setImportType] = useState<"json" | "json-schema">("json");
  const [importValue, setImportValue] = useState<string | undefined>();
  const [isObject, setIsObject] = useState(false);
  const [isArray, setIsArray] = useState(false);
  const [isNumber, setIsNumber] = useState(false);
  const [isBoolean, setIsBoolean] = useState(false);
  const [isInteger, setIsInteger] = useState(false);
  const [isString, setIsString] = useState(false);
  const editorRef = useRef<any>(null);
  const isRoot = typeof propertyName === "undefined";

  useEffect(() => {
    setSchema(props.schema);
  }, [props.schema]);

  useEffect(() => {
    setNamePath(props.namePath ? props.namePath : []);
  }, [props.namePath]);

  useEffect(() => {
    setNodeDepth(props.nodeDepth ? props.nodeDepth : 0);
  }, [props.nodeDepth]);

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
    if (!advancedModal || !formSchema) {
      return;
    }
    advancedForm.setFieldsValue(formSchema);
    setIsObject(formSchema.type === "object");
    setIsArray(formSchema.type === "array");
    setIsNumber(formSchema.type === "number");
    setIsBoolean(formSchema.type === "boolean");
    setIsInteger(formSchema.type === "integer");
    setIsString(formSchema.type === "string");
  }, [advancedModal, formSchema]);

  function handleEditorDidMount(editor: any) {
    editorRef.current = editor;
  }

  const schemaItems: any = schema.items;
  const addChildItems =
    !!(
      schema.type === "object" ||
      (isArrayItems && schemaItems?.type === "object")
    ) &&
    !isArrayItems &&
    !isRoot;

  if (!schema.type) {
    return <></>;
  }

  return (
    <>
      <div
        className="flex pb-2 items-center gap-2"
        style={{ marginLeft: nodeDepth * 48 }}
      >
        <div className="shrink-0 w-10">
          {schema.type === "object" && (
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setExpand(!expand)}
                >
                  {expand ? (
                    <ChevronDown className="size-4" />
                  ) : (
                    <ChevronRight className="size-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{expand ? "Collapse" : "Expand"}</TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="flex-grow">
          <Input
            // status={!isRoot && propertyName.length === 0 ? "error" : undefined}
            disabled={isRoot || isArrayItems}
            value={isRoot ? "root" : propertyName}
            placeholder={"Property Name"}
            onBlur={() => {
              if (propertyName?.length === 0) {
                toast.error("Property name cannot be empty", {
                  description: "Please input property name",
                });
                return;
              }
              if (
                renameProperty &&
                propertyName &&
                propertyName?.length !== 0
              ) {
                renameProperty(namePath, propertyName);
              }
            }}
            onChange={(name) => setPropertyName(name.target.value)}
          />
        </div>
        <div className="shrink-0">
          <Checkbox
            disabled={!!isArrayItems || !!isRoot}
            checked={!!isRequire}
            onCheckedChange={(checked) => {
              if (updateRequiredProperty && propertyName) {
                updateRequiredProperty(
                  namePath.slice(0, parentSchemaDepth),
                  propertyName,
                  !checked
                );
              }
            }}
          />
        </div>
        <div
          //  flex={"95px"} style={{ marginLeft: 5 }}
          className="w-28"
        >
          <Select
            value={schema.type as string}
            onValueChange={(type) => {
              if (changeSchema) {
                changeSchema(
                  namePath,
                  getDefaultSchema(type as JSONSchema7TypeName),
                  "type"
                );
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SchemaTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div
          className="flex-grow"
          //  flex={"auto"} style={{ marginLeft: 5 }}
        >
          <Input
            placeholder={"Title"}
            value={schemaTitle}
            onBlur={() => {
              if (changeSchema) {
                changeSchema(
                  namePath.concat(getPropertyIndex(schema, "title")),
                  schemaTitle,
                  "title"
                );
              }
            }}
            onChange={(title) => setSchemaTitle(title.target.value)}
          />
        </div>
        <div
          className="flex-grow"
          //  flex={"auto"} style={{ marginLeft: 5 }}
        >
          <Input
            placeholder={"Description"}
            value={schemaDescription}
            onBlur={() => {
              if (changeSchema) {
                changeSchema(
                  namePath.concat(getPropertyIndex(schema, "description")),
                  schemaDescription,
                  "description"
                );
              }
            }}
            onChange={(description) =>
              setSchemaDescription(description.target.value)
            }
          />
        </div>
        <div
          className="flex shrink-0 gap-2"
          //  flex={"72px"} style={{ marginLeft: 5 }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                onClick={() => {
                  if (
                    handleAdvancedSettingClick &&
                    !handleAdvancedSettingClick(
                      namePath,
                      schema,
                      isRoot || schema.type === "object"
                        ? undefined
                        : propertyName
                    )
                  ) {
                    return;
                  }
                  setFormSchema(schema);
                  setAdvancedModal(!advancedModal);
                }}
              >
                <Settings className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Advanced Settings</TooltipContent>
          </Tooltip>
          {(!isRoot && !isArrayItems) || schema.type === "object" ? (
            addChildItems ? (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button size="icon">
                    <Plus className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => {
                      if (addProperty) {
                        addProperty(namePath, false);
                      }
                    }}
                  >
                    Add Node
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      if (addProperty) {
                        addProperty(namePath, true);
                      }
                    }}
                  >
                    Add Child Node
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                size="icon"
                onClick={() => {
                  if (addProperty) {
                    addProperty(namePath, !(!isArrayItems && !isRoot));
                  }
                }}
              >
                <Plus className="size-4" />
              </Button>
            )
          ) : (
            <div className="w-10" />
          )}
          <div>
            {isRoot ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    onClick={() => setImportModal(true)}
                    disabled={false}
                  >
                    <FileJson2 className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Import JSON</TooltipContent>
              </Tooltip>
            ) : !isArrayItems ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => {
                      if (removeProperty) {
                        removeProperty(namePath);
                      }
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Remove Node</TooltipContent>
              </Tooltip>
            ) : (
              <div className="w-10" />
            )}
          </div>
          {isRoot && schema.type !== "object" && (
            <div>{!isArrayItems && <div className="w-10" />}</div>
          )}
        </div>
      </div>
      {schema.type === "object" &&
        expand &&
        schema.properties &&
        Object.keys(schema.properties).map((name) => {
          if (schema.properties) {
            return (
              <div key={String(name)}>
                <SchemaItem
                  {...props}
                  isRequire={schema.required?.includes(name)}
                  isArrayItems={false}
                  nodeDepth={nodeDepth + 1}
                  parentSchemaDepth={!isRoot ? parentSchemaDepth + 2 : 0}
                  namePath={namePath.concat(
                    getPropertyIndex(schema, "properties"),
                    getPropertyIndex(schema.properties, name)
                  )}
                  propertyName={name}
                  schema={schema.properties[name] as JSONSchema7}
                  handleAdvancedSettingClick={handleAdvancedSettingClick}
                />
              </div>
            );
          }
          return <></>;
        })}
      {schema.type === "array" && expand && (
        <SchemaItem
          {...props}
          isRequire={false}
          isArrayItems={true}
          nodeDepth={nodeDepth + 1}
          parentSchemaDepth={!isRoot ? parentSchemaDepth + 1 : 0}
          propertyName={"items"}
          namePath={namePath.concat(getPropertyIndex(schema, "items"))}
          schema={schema.items as JSONSchema7}
          handleAdvancedSettingClick={handleAdvancedSettingClick}
        />
      )}
      <Dialog
        open={advancedModal}
        onOpenChange={(open) => setAdvancedModal(open)}
      >
        <DialogContent className="md:max-w-screen-md">
          <DialogHeader>
            <DialogTitle>Advance Settings</DialogTitle>
          </DialogHeader>
          <Form
            form={advancedForm}
            onValuesChange={(_, allValues) => {
              if (editorRef.current) {
                editorRef.current.setValue(
                  JSON.stringify({ ...formSchema, ...allValues }, null, 2)
                );
              }
            }}
          >
            <div className="grid grid-cols-6 gap-2">
              {!isObject && SchemaTypes.indexOf(formSchema?.type) !== -1 && (
                <div className="font-semibold col-span-6">Basic Settings</div>
              )}
              {(isString || isNumber || isInteger || isBoolean) && (
                <>
                  <p className="flex items-center justify-end">Default value</p>
                  <div className="col-span-5">
                    <Form.Item noStyle name={"default"}>
                      {isString && (
                        <Input
                          style={{ width: "100%" }}
                          placeholder={"Input default value"}
                        />
                      )}
                      {(isNumber || isInteger) && (
                        <Input
                          type="number"
                          style={{ width: "100%" }}
                          placeholder={"Input default value"}
                        />
                      )}
                      {isBoolean && (
                        <Select
                        // value={}
                        // onValueChange={(val) => ...(val === 'true' ? true : false)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select default value" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={"true"}>true</SelectItem>
                            <SelectItem value={"false"}>false</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </Form.Item>
                  </div>
                </>
              )}
              {isString && (
                <>
                  <p className="flex items-center justify-end">Min Length</p>
                  <div className="col-span-2">
                    <Form.Item noStyle name={"minLength"}>
                      <Input
                        type="number"
                        min={0}
                        style={{ width: "100%" }}
                        // parser={(value) =>
                        //   value ? parseInt(value.replace(/\D/g, ""), 10) : ""
                        // }
                        // formatter={(value) =>
                        //   value ? `${Math.floor(Math.max(value, 0))}` : ""
                        // }
                        placeholder={"Input min length"}
                      />
                    </Form.Item>
                  </div>
                  <p className="flex items-center justify-end">Max length</p>
                  <div className="col-span-2">
                    <Form.Item noStyle name={"maxLength"}>
                      <Input
                        type="number"
                        min={0}
                        style={{ width: "100%" }}
                        // parser={(value) =>
                        //   value ? parseInt(value.replace(/\D/g, ""), 10) : ""
                        // }
                        // formatter={(value) =>
                        //   value ? `${Math.floor(Math.max(value, 0))}` : ""
                        // }
                        placeholder={"Input max length"}
                      />
                    </Form.Item>
                  </div>
                </>
              )}
              {(isNumber || isInteger) && (
                <>
                  <p className="flex items-center justify-end">Min value</p>
                  <div className="col-span-2">
                    <Form.Item noStyle name={"minimum"}>
                      <Input
                        type="number"
                        style={{ width: "100%" }}
                        placeholder={"Input min value"}
                      />
                    </Form.Item>
                  </div>
                  <p className="flex items-center justify-end">Max value</p>
                  <div className="col-span-2">
                    <Form.Item noStyle name={"maximum"}>
                      <Input
                        type="number"
                        style={{ width: "100%" }}
                        placeholder={"Input max value"}
                      />
                    </Form.Item>
                  </div>
                  <p className="flex items-center justify-end">Exclusive Min</p>
                  <div className="col-span-2">
                    <Form.Item noStyle name={"exclusiveMinimum"}>
                      <Input
                        type="number"
                        style={{ width: "100%" }}
                        placeholder={"Input exclusive min value"}
                      />
                    </Form.Item>
                  </div>
                  <p className="flex items-center justify-end">Exclusive Max</p>
                  <div className="col-span-2">
                    <Form.Item noStyle name={"exclusiveMaximum"}>
                      <Input
                        type="number"
                        style={{ width: "100%" }}
                        placeholder={"Input exclusive max value"}
                      />
                    </Form.Item>
                  </div>
                </>
              )}
              {isString && (
                <>
                  <p className="flex items-center justify-end">Regex pattern</p>
                  <div className="col-span-5">
                    <Form.Item noStyle name={"pattern"}>
                      <Input placeholder={"Input regex pattern"} />
                    </Form.Item>
                  </div>

                  <p className="flex items-center justify-end">Format</p>
                  <div className="col-span-2 flex gap-2">
                    <Form.Item noStyle name={"format"}>
                      {/* <Select
                      allowClear
                      options={StringFormat}
                      placeholder={"Input format"}
                      style={{ width: "100%" }}
                    /> */}
                      <Select
                        value={""}
                        onValueChange={(val) => console.log(val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Input Format" />
                        </SelectTrigger>
                        <SelectContent>
                          {StringFormat.map((format) => (
                            <SelectItem key={format.value} value={format.value}>
                              {format.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        size="icon"
                        variant="outline"
                        className="shrink-0"
                      >
                        <X className="size-4" />
                      </Button>
                    </Form.Item>
                  </div>
                </>
              )}
              {isArray && (
                <>
                  <p className="flex items-center justify-end">Unique items</p>
                  <div className="col-span-5">
                    <Form.Item
                      noStyle
                      name={"uniqueItems"}
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </div>
                  <p className="flex items-center justify-end">Min Length</p>
                  <div className="col-span-2">
                    <Form.Item noStyle name={"minItems"}>
                      <Input
                        type="number"
                        style={{ width: "100%" }}
                        // parser={(value) =>
                        //   value ? parseInt(value.replace(/\D/g, ""), 10) : ""
                        // }
                        // formatter={(value) =>
                        //   value ? `${Math.floor(Math.max(value, 0))}` : ""
                        // }
                        placeholder={"Input min length"}
                      />
                    </Form.Item>
                  </div>
                  <p className="flex items-center justify-end">Max Length</p>
                  <div className="col-span-2">
                    <Form.Item noStyle name={"maxItems"}>
                      <Input
                        type="number"
                        style={{ width: "100%" }}
                        // parser={(value) =>
                        //   value ? parseInt(value.replace(/\D/g, ""), 10) : ""
                        // }
                        // formatter={(value) =>
                        //   value ? `${Math.floor(Math.max(value, 0))}` : ""
                        // }
                        placeholder={"Input max length"}
                      />
                    </Form.Item>
                  </div>
                </>
              )}
              {(isString || isNumber || isInteger) && (
                <div className="col-span-6 grid grid-cols-6 gap-2">
                  <p className="flex items-center justify-end">Enums</p>
                  <div className="col-span-5">
                    <Form.List name="enums">
                      {(fields, { add, remove }) => (
                        <>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            {fields.map(({ key, name, ...restField }) => (
                              <div className="flex gap-2" key={key}>
                                <Form.Item
                                  {...restField}
                                  noStyle
                                  name={[name]}
                                  rules={[{ required: true }]}
                                >
                                  {isString && (
                                    <Input placeholder="Input enum value" />
                                  )}
                                  {(isNumber || isInteger) && (
                                    <Input
                                      type="number"
                                      style={{ width: "100%" }}
                                      placeholder="Input enum value"
                                    />
                                  )}
                                </Form.Item>
                                <Button
                                  size="icon"
                                  color="destructive"
                                  variant="destructive"
                                  onClick={() => remove(name)}
                                  className="shrink-0"
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <Form.Item noStyle>
                            <Button onClick={() => add()}>
                              <Plus className="size-4" />
                              Add enum
                            </Button>
                          </Form.Item>
                        </>
                      )}
                    </Form.List>
                  </div>
                </div>
              )}
              <div className="font-semibold col-span-6">Json Schema</div>

              {/* <MonacoEditor
            height={300}
            language="json"
            value={JSON.stringify(formSchema, null, 2)}
            handleEditorDidMount={handleEditorDidMount}
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
          /> */}
              <CodeMirrorJson
                className="col-span-6"
                value={JSON.stringify(formSchema || {}, null, 2)}
                editable
                theme="dark"
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
            </div>
          </Form>
          <DialogFooter>
            <Button
              onClick={() => {
                if (!changeSchema) {
                  return;
                }
                if (isRoot || schema.type === "object") {
                  changeSchema(namePath, { ...schema, ...formSchema });
                  setAdvancedModal(!advancedModal);
                  return;
                }
                advancedForm
                  .validateFields()
                  .then((values) => {
                    changeSchema(
                      namePath,
                      { ...schema, ...formSchema, ...values },
                      propertyName
                    );
                    setAdvancedModal(!advancedModal);
                  })
                  .catch((errorInfo) => {
                    console.log("Failed:", errorInfo);
                  });
              }}
            >
              Save
            </Button>
            <Button
              variant="outline"
              onClick={() => setAdvancedModal(!advancedModal)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={importModal} onOpenChange={(open) => setImportModal(open)}>
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
            {/* Monaco Editor */}
            {/* <MonacoEditor
            height={390}
            language="json"
            handleEditorDidMount={handleEditorDidMount}
            onChange={(value) => setImportValue(value)}
          /> */}
            <CodeMirrorJson
              className="w-full"
              // value={JSON.stringify(formSchema || {}, null, 2)}
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
                if (changeSchema) {
                  changeSchema([], schema);
                  setImportModal(!importModal);
                  setImportValue(undefined);
                }
              }}
            >
              Import
            </Button>
            <Button
              onClick={() => setImportModal(!importModal)}
              variant="outline"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SchemaItem;
