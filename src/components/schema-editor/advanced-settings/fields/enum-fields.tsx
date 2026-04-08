import { useFieldArray, useFormContext } from "react-hook-form";
import { FormLabel, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputNumber } from "@/components/ui/input-number";
import { Plus, Trash2 } from "lucide-react";
import { FormItemWrapper } from "./form-item-wrapper";

export function EnumFields({
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
