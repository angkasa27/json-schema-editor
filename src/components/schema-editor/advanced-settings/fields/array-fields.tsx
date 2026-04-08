import { useFormContext } from "react-hook-form";
import { FormField } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { InputNumber } from "@/components/ui/input-number";
import { FormItemWrapper } from "./form-item-wrapper";

export function ArrayFields() {
  const { control } = useFormContext();

  return (
    <>
      <div className="col-span-2">
        <FormField
          control={control}
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
          control={control}
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
          control={control}
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
  );
}
