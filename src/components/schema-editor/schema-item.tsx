"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import type { JSONSchema7, JSONSchema7TypeName } from "@/lib/schema/types";
import {
  getDefaultSchema,
  getPropertyIndex,
  SCHEMA_TYPE_OPTIONS,
} from "@/lib/schema/utils";
import { useSchemaStore } from "@/lib/schema/store";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Settings,
  Trash2,
  Braces,
  Brackets,
  Type,
  Hash,
  Binary,
  ToggleLeft,
  Ban,
  Boxes,
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

const TypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "object":
      return <Braces className="size-3.5 mr-2 text-muted-foreground" />;
    case "array":
      return <Brackets className="size-3.5 mr-2 text-muted-foreground" />;
    case "string":
      return <Type className="size-3.5 mr-2 text-muted-foreground" />;
    case "number":
      return <Hash className="size-3.5 mr-2 text-muted-foreground" />;
    case "integer":
      return <Binary className="size-3.5 mr-2 text-muted-foreground" />;
    case "boolean":
      return <ToggleLeft className="size-3.5 mr-2 text-muted-foreground" />;
    case "null":
      return <Ban className="size-3.5 mr-2 text-muted-foreground" />;
    default:
      return null;
  }
};

// =============================================================================
// Types
// =============================================================================

type SchemaItemProps = {
  propertyName?: string;
  nodeDepth?: number;
  parentSchemaDepth?: number;
  namePath?: number[];
  isArrayItems?: boolean;
  isRequire?: boolean;
  schema: JSONSchema7;
};

// =============================================================================
// Container (recursive tree renderer)
// =============================================================================

function SchemaItemContainer(props: SchemaItemProps) {
  const {
    parentSchemaDepth = 0,
    propertyName,
    nodeDepth = 0,
    namePath = [],
    schema,
  } = props;

  const [expand, setExpand] = useState(true);

  const isRoot = typeof propertyName === "undefined";

  if (!schema.type) {
    return null;
  }

  return (
    <>
      <div
        className="flex pb-3 items-start lg:items-center gap-2"
        style={{ marginLeft: nodeDepth * 48 }}
      >
        <div className="shrink-0 w-10 mt-1 lg:mt-0">
          {schema.type === "object" && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setExpand(!expand)}
                    className="transition-transform"
                  >
                    {expand ? (
                      <ChevronDown className="size-4" />
                    ) : (
                      <ChevronRight className="size-4" />
                    )}
                  </Button>
                }
              />
              <TooltipContent>{expand ? "Collapse" : "Expand"}</TooltipContent>
            </Tooltip>
          )}
        </div>
        <SchemaItemRow {...props} />
      </div>

      {/* Render child properties for objects */}
      {schema.type === "object" &&
        expand &&
        schema.properties &&
        Object.keys(schema.properties).map((name) => {
          if (!schema.properties) return null;
          return (
            <div key={name}>
              <SchemaItemContainer
                {...props}
                isRequire={schema.required?.includes(name)}
                isArrayItems={false}
                nodeDepth={nodeDepth + 1}
                parentSchemaDepth={!isRoot ? parentSchemaDepth + 2 : 0}
                namePath={namePath.concat(
                  getPropertyIndex(schema, "properties"),
                  getPropertyIndex(schema.properties, name),
                )}
                propertyName={name}
                schema={schema.properties[name] as JSONSchema7}
              />
            </div>
          );
        })}

      {/* Empty State */}
      {schema.type === "object" &&
        expand &&
        (!schema.properties || Object.keys(schema.properties).length === 0) && (
          <div
            className="flex flex-col items-center justify-center p-6 border border-dashed rounded-lg bg-muted/10 text-center mb-4"
            style={{ marginLeft: nodeDepth * 48 }}
          >
            <Boxes className="size-10 text-muted-foreground/30 mb-2" />
            <h3 className="text-sm font-medium">No properties</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Add properties to define object structure
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const { addProperty } = useSchemaStore.getState();
                addProperty(namePath, true);
              }}
            >
              <Plus className="size-3.5 mr-1.5" />
              Add First Property
            </Button>
          </div>
        )}

      {/* Render items for arrays */}
      {schema.type === "array" && expand && (
        <SchemaItemContainer
          {...props}
          isRequire={false}
          isArrayItems={true}
          nodeDepth={nodeDepth + 1}
          parentSchemaDepth={!isRoot ? parentSchemaDepth + 1 : 0}
          propertyName={"items"}
          namePath={namePath.concat(getPropertyIndex(schema, "items"))}
          schema={schema.items as JSONSchema7}
        />
      )}
    </>
  );
}

export default SchemaItemContainer;

// =============================================================================
// Row (single schema item controls)
// =============================================================================

const SchemaItemRow = memo(function SchemaItemRow(props: SchemaItemProps) {
  const {
    isArrayItems,
    parentSchemaDepth = 0,
    isRequire,
    namePath = [],
  } = props;

  const {
    changeSchema,
    renameProperty,
    removeProperty,
    addProperty,
    updateRequiredProperty,
  } = useSchemaStore();

  const [schema, setSchema] = useState(props.schema);
  const [propertyName, setPropertyName] = useState(props.propertyName);
  const [schemaTitle, setSchemaTitle] = useState(schema.title);
  const [schemaDescription, setSchemaDescription] = useState(
    schema.description,
  );
  const [advancedModal, setAdvancedModal] = useState(false);

  const isRoot = typeof propertyName === "undefined";

  useEffect(() => {
    setSchema(props.schema);
  }, [props.schema]);

  useEffect(() => {
    setPropertyName(props.propertyName);
  }, [props.propertyName]);

  useEffect(() => {
    setSchemaTitle(schema.title);
  }, [schema.title]);

  useEffect(() => {
    setSchemaDescription(schema.description);
  }, [schema.description]);

  const addChildItems = useMemo(
    () =>
      !!(
        schema.type === "object" ||
        (isArrayItems && (schema.items as JSONSchema7)?.type === "object")
      ) &&
      !isArrayItems &&
      !isRoot,
    [schema.type, schema.items, isArrayItems, isRoot],
  );

  const handlePropertyNameBlur = useCallback(() => {
    if (propertyName?.length === 0) {
      toast.error("Property name cannot be empty", {
        description: "Please enter a property name",
      });
      return;
    }
    if (propertyName && propertyName.length !== 0) {
      const success = renameProperty(namePath, propertyName);
      if (!success) {
        toast.error("Property name already exists", {
          description: `The key "${propertyName}" is already used.`,
        });
        setPropertyName(props.propertyName);
      }
    }
  }, [namePath, propertyName, renameProperty, props.propertyName]);

  const handleTitleBlur = useCallback(() => {
    changeSchema(
      namePath.concat(getPropertyIndex(schema, "title")),
      schemaTitle,
      "title",
    );
  }, [changeSchema, namePath, schema, schemaTitle]);

  const handleDescriptionBlur = useCallback(() => {
    changeSchema(
      namePath.concat(getPropertyIndex(schema, "description")),
      schemaDescription,
      "description",
    );
  }, [changeSchema, namePath, schema, schemaDescription]);

  return (
    <div className="flex flex-col lg:flex-row flex-1 gap-2 min-w-0">
      <div className="flex items-center gap-2 w-full lg:w-auto flex-1 lg:flex-none">
        {/* Property Name */}
        <div className="flex-1 lg:grow min-w-0">
          <Input
            disabled={isRoot || isArrayItems}
            value={isRoot ? "root" : (propertyName ?? "")}
            placeholder="Property Name"
            onBlur={handlePropertyNameBlur}
            onChange={(e) => setPropertyName(e.target.value)}
            className="h-9"
          />
        </div>

        {/* Required Checkbox */}
        <div className="shrink-0 flex items-center">
          <Tooltip>
            <TooltipTrigger
              render={
                <div className="flex items-center">
                  <Checkbox
                    disabled={!!isArrayItems || !!isRoot}
                    checked={!!isRequire}
                    onCheckedChange={(checked) => {
                      if (propertyName) {
                        updateRequiredProperty(
                          namePath.slice(0, parentSchemaDepth),
                          propertyName,
                          !checked,
                        );
                      }
                    }}
                  />
                </div>
              }
            />
            <TooltipContent>Required</TooltipContent>
          </Tooltip>
        </div>

        {/* Type Select */}
        <div className="w-28 shrink-0">
          <Select
            value={schema.type as string}
            onValueChange={(type) => {
              changeSchema(
                namePath,
                getDefaultSchema(type as JSONSchema7TypeName),
                "type",
              );
            }}
          >
            <SelectTrigger className="w-full h-9!">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SCHEMA_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center">
                    <TypeIcon type={option.value} />
                    <span>{option.value}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full lg:w-auto flex-1">
        {/* Title */}
        <div className="flex-1 lg:grow min-w-0">
          <Input
            placeholder="Title"
            value={schemaTitle ?? ""}
            onBlur={handleTitleBlur}
            onChange={(e) => setSchemaTitle(e.target.value)}
            className="h-9"
          />
        </div>

        {/* Description */}
        <div className="flex-1 lg:grow min-w-0">
          <Input
            placeholder="Description"
            value={schemaDescription ?? ""}
            onBlur={handleDescriptionBlur}
            onChange={(e) => setSchemaDescription(e.target.value)}
            className="h-9"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 lg:ml-auto">
        {/* Action Buttons */}
        <div className="flex shrink-0 gap-1 mt-2 lg:mt-0">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setAdvancedModal(true)}
                  className="h-9 w-9"
                >
                  <Settings className="size-4" />
                </Button>
              }
            />
            <TooltipContent>Advanced Settings</TooltipContent>
          </Tooltip>

          {(!isRoot && !isArrayItems) || schema.type === "object" ? (
            addChildItems ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button size="icon" variant="outline" className="h-9 w-9">
                      <Plus className="size-4" />
                    </Button>
                  }
                />
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => addProperty(namePath, false)}
                  >
                    Add Sibling
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addProperty(namePath, true)}>
                    Add Child
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        addProperty(namePath, !(!isArrayItems && !isRoot))
                      }
                      className="h-9 w-9"
                    >
                      <Plus className="size-4" />
                    </Button>
                  }
                />
                <TooltipContent>Add Property</TooltipContent>
              </Tooltip>
            )
          ) : (
            <div className="w-9" />
          )}

          {!isArrayItems && !isRoot ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => removeProperty(namePath)}
                    className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                }
              />
              <TooltipContent>Remove</TooltipContent>
            </Tooltip>
          ) : (
            <div className="w-9" />
          )}
        </div>
      </div>

      {/* Advanced Settings Dialog */}
      {advancedModal && (
        <DialogAdvancedSettings
          open
          onClose={() => setAdvancedModal(false)}
          schema={schema}
          onSubmit={(payload: Record<string, unknown>) => {
            setSchema(payload as import("@/lib/schema/types").JSONSchema7);
            if (isRoot || schema.type === "object") {
              changeSchema(namePath, { ...schema, ...payload });
            } else {
              changeSchema(namePath, { ...schema, ...payload }, propertyName);
            }
            setAdvancedModal(false);
          }}
        />
      )}
    </div>
  );
});
