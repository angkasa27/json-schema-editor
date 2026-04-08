import { memo, useCallback, useMemo, useState } from "react";
import type { JSONSchema7, JSONSchema7TypeName } from "@/lib/schema/types";
import { getDefaultSchema, getPropertyIndex, SCHEMA_TYPE_OPTIONS } from "@/lib/schema/utils";
import { useSchemaStore } from "@/lib/schema/store";
import { Braces, Brackets, Type, Hash, Binary, ToggleLeft, Ban } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogAdvancedSettings } from "../advanced-settings/index";
import { SchemaRowActions } from "./schema-row-actions";

type SchemaItemProps = {
  propertyName?: string;
  nodeDepth?: number;
  parentSchemaDepth?: number;
  namePath?: number[];
  isArrayItems?: boolean;
  isRequire?: boolean;
  schema: JSONSchema7;
};

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

export const SchemaItemRow = memo(function SchemaItemRow(props: SchemaItemProps) {
  const {
    isArrayItems,
    parentSchemaDepth = 0,
    isRequire,
    namePath = [],
  } = props;

  const {
    changeSchema,
    renameProperty,
    updateRequiredProperty,
  } = useSchemaStore();

  const [schema, setSchema] = useState(props.schema);
  const [prevSchema, setPrevSchema] = useState(props.schema);

  const [propertyName, setPropertyName] = useState(props.propertyName);
  const [prevPropName, setPrevPropName] = useState(props.propertyName);

  const [schemaTitle, setSchemaTitle] = useState(schema.title);
  const [prevTitle, setPrevTitle] = useState(schema.title);

  const [schemaDescription, setSchemaDescription] = useState(schema.description);
  const [prevDesc, setPrevDesc] = useState(schema.description);

  const [advancedModal, setAdvancedModal] = useState(false);

  const isRoot = typeof propertyName === "undefined";

  if (props.schema !== prevSchema) {
    setPrevSchema(props.schema);
    setSchema(props.schema);
  }
  if (props.propertyName !== prevPropName) {
    setPrevPropName(props.propertyName);
    setPropertyName(props.propertyName);
  }
  if (schema.title !== prevTitle) {
    setPrevTitle(schema.title);
    setSchemaTitle(schema.title);
  }
  if (schema.description !== prevDesc) {
    setPrevDesc(schema.description);
    setSchemaDescription(schema.description);
  }

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
        <SchemaRowActions
          namePath={namePath}
          addChildItems={addChildItems}
          isArrayItems={!!isArrayItems}
          isRoot={isRoot}
          schemaType={schema.type as string}
          setAdvancedModal={setAdvancedModal}
        />
      </div>

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
