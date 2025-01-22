import _ from "lodash";
import { useCallback, useEffect, useState } from "react";
import { JSONSchema7, JSONSchema7TypeName } from "../types";
import {
  getDefaultSchema,
  getPropertyIndex,
  SchemaTypeOptions,
} from "../utils";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Settings,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
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
import { DialogAdvancedSettings } from "./dialog-advanced-settings";

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
              <TooltipTrigger asChild>
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
        <div className="shrink-0 flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
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
            </TooltipTrigger>
            <TooltipContent>is Required</TooltipContent>
          </Tooltip>
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
                <DropdownMenuTrigger asChild>
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
            {!isArrayItems && !isRoot ? (
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

      <DialogAdvancedSettings
        open={advancedModal}
        onClose={() => setAdvancedModal(false)}
        formSchema={formSchema}
        setFormSchema={setFormSchema}
        onSubmit={(payload) => {
          if (!changeSchema) {
            return;
          }
          if (isRoot || schema.type === "object") {
            changeSchema(namePath, { ...schema, ...payload });
            setAdvancedModal(!advancedModal);
            return;
          }
          changeSchema(namePath, { ...schema, ...payload }, propertyName);
          setAdvancedModal(!advancedModal);
        }}
      />
    </>
  );
}

export default SchemaItem;
