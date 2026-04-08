import { useFormContext } from "react-hook-form";
import { FormField } from "@/components/ui/form";
import { InputNumber } from "@/components/ui/input-number";
import { FormItemWrapper } from "./form-item-wrapper";

export function NumberFields() {
  const { control } = useFormContext();

  return (
    <>
      <div className="col-span-1">
        <FormField
          control={control}
          name="minimum"
          render={({ field }) => (
            <FormItemWrapper label="Min Value">
              <InputNumber
                className="w-full"
                placeholder="Min value"
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
          name="maximum"
          render={({ field }) => (
            <FormItemWrapper label="Max Value">
              <InputNumber
                className="w-full"
                placeholder="Max value"
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
          name="exclusiveMinimum"
          render={({ field }) => (
            <FormItemWrapper label="Exclusive Min">
              <InputNumber
                className="w-full"
                placeholder="Exclusive min"
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
          name="exclusiveMaximum"
          render={({ field }) => (
            <FormItemWrapper label="Exclusive Max">
              <InputNumber
                className="w-full"
                placeholder="Exclusive max"
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
