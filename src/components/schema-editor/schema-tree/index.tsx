import { useState } from "react";
import type { JSONSchema7 } from "@/lib/schema/types";
import { getPropertyIndex } from "@/lib/schema/utils";
import { useSchemaStore } from "@/lib/schema/store";
import { ChevronDown, ChevronRight, Plus, Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SchemaItemRow } from "./schema-row";

type SchemaItemProps = {
  propertyName?: string;
  nodeDepth?: number;
  parentSchemaDepth?: number;
  namePath?: number[];
  isArrayItems?: boolean;
  isRequire?: boolean;
  schema: JSONSchema7;
};

export function SchemaItemContainer(props: SchemaItemProps) {
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
