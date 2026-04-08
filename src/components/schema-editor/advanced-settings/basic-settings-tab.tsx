import { useFormContext } from "react-hook-form";
import { FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InputNumber } from "@/components/ui/input-number";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormItemWrapper } from "./fields/form-item-wrapper";
import { StringFields } from "./fields/string-fields";
import { NumberFields } from "./fields/number-fields";
import { ArrayFields } from "./fields/array-fields";
import { EnumFields } from "./fields/enum-fields";

export function BasicSettingsTab({
  isString,
  isNumber,
  isInteger,
  isBoolean,
  isArray,
}: {
  isString: boolean;
  isNumber: boolean;
  isInteger: boolean;
  isBoolean: boolean;
  isArray: boolean;
}) {
  const { control } = useFormContext();

  return (
    <>
      {/* General metadata */}
      <div className="col-span-2 space-y-4 mb-2">
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItemWrapper label="Title">
              <Input
                className="w-full"
                placeholder="Enter field title"
                disabled={field.disabled}
                name={field.name}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                value={(field.value as string) || ""}
              />
            </FormItemWrapper>
          )}
        />
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItemWrapper label="Description">
              <Textarea
                className="w-full resize-none"
                rows={3}
                placeholder="Enter field description"
                disabled={field.disabled}
                name={field.name}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                value={(field.value as string) || ""}
              />
            </FormItemWrapper>
          )}
        />
      </div>

      {/* Default value */}
      {(isString || isNumber || isInteger || isBoolean) && (
        <div className="col-span-2">
          <FormField
            control={control}
            name="default"
            render={({ field }) => (
              <>
                {isString && (
                  <FormItemWrapper label="Default Value">
                    <Input
                      className="w-full"
                      placeholder="Enter default value"
                      name={field.name}
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                      ref={field.ref}
                      disabled={field.disabled}
                      value={(field.value ?? "") as string | number | readonly string[]}
                    />
                  </FormItemWrapper>
                )}
                {(isNumber || isInteger) && (
                  <FormItemWrapper label="Default Value">
                    <InputNumber
                      className="w-full"
                      placeholder="Enter default value"
                      value={field.value as number}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                  </FormItemWrapper>
                )}
                {isBoolean && (
                  <FormItemWrapper label="Default Value">
                    <Select
                      value={String(field.value ?? "")}
                      onValueChange={(val) => field.onChange(val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select default value" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">true</SelectItem>
                        <SelectItem value="false">false</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItemWrapper>
                )}
              </>
            )}
          />
        </div>
      )}

      {/* String-specific fields */}
      {isString && <StringFields />}

      {/* Number/Integer fields */}
      {(isNumber || isInteger) && <NumberFields />}

      {/* Array fields */}
      {isArray && <ArrayFields />}

      {/* Enum fields */}
      {(isString || isNumber || isInteger) && (
        <EnumFields
          isString={isString}
          isNumber={isNumber}
          isInteger={isInteger}
        />
      )}
    </>
  );
}
