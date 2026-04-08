import { useFormContext } from "react-hook-form";
import { FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputNumber } from "@/components/ui/input-number";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STRING_FORMATS } from "@/lib/schema/utils";
import { FormItemWrapper } from "./form-item-wrapper";

export function StringFields() {
  const { control } = useFormContext();

  return (
    <>
      <div className="col-span-1">
        <FormField
          control={control}
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
          control={control}
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
          control={control}
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
          control={control}
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
  );
}
