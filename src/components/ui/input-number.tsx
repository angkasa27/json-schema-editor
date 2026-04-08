"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface InputNumberProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onChange?: (value: number | undefined) => void;
  value?: number | string;
  min?: number;
  max?: number;
}

const InputNumber = React.forwardRef<HTMLInputElement, InputNumberProps>(
  ({ className, onChange, value, min, max, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      if (rawValue === "" || rawValue === "-") {
        onChange?.(undefined);
        return;
      }
      const num = Number(rawValue);
      if (!isNaN(num)) {
        let clamped = num;
        if (min !== undefined) clamped = Math.max(clamped, min);
        if (max !== undefined) clamped = Math.min(clamped, max);
        onChange?.(clamped);
      }
    };

    return (
      <Input
        ref={ref}
        type="number"
        className={cn("tabular-nums", className)}
        value={value ?? ""}
        onChange={handleChange}
        min={min}
        max={max}
        {...props}
      />
    );
  }
);

InputNumber.displayName = "InputNumber";

export { InputNumber };
