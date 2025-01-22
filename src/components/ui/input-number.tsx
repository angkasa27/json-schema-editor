import { forwardRef } from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import { Input, InputProps } from "./input";

export interface InputNumberProps
  extends Omit<InputProps, "onChange" | "type">,
    Omit<NumericFormatProps, "defaultValue" | "value" | "onChange"> {
  onChange: (value: number | "") => void;
}

export const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(
  (props, ref) => {
    const { onChange, decimalScale = 5, ...numericFormatProps } = props;

    return (
      <NumericFormat
        decimalScale={decimalScale}
        customInput={Input}
        thousandSeparator="."
        decimalSeparator=","
        itemRef={ref}
        valueIsNumericString={false}
        onValueChange={({ floatValue, value, formattedValue }) => {
          onChange?.(!value ? "" : floatValue!);
        }}
        allowNegative={false}
        {...(numericFormatProps as any)}
      />
    );
  }
);

InputNumber.displayName = "InputNumber";
