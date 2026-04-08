import { useSchemaStore } from "@/lib/schema/store";
import { Plus, Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export function SchemaRowActions({
  namePath,
  addChildItems,
  isRoot,
  isArrayItems,
  schemaType,
  setAdvancedModal,
}: {
  namePath: number[];
  addChildItems: boolean;
  isRoot: boolean;
  isArrayItems: boolean;
  schemaType: string | undefined;
  setAdvancedModal: (v: boolean) => void;
}) {
  const { addProperty, removeProperty } = useSchemaStore();

  return (
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

      {(!isRoot && !isArrayItems) || schemaType === "object" ? (
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
              <DropdownMenuItem onClick={() => addProperty(namePath, false)}>
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
                  onClick={() => addProperty(namePath, !(!isArrayItems && !isRoot))}
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
  );
}
