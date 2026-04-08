import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

export function FormItemWrapper({
  children,
  className,
  label,
}: {
  label?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <FormItem className={cn("w-full", className)}>
      {label && <FormLabel>{label}</FormLabel>}
      <FormControl>{children}</FormControl>
      <FormMessage />
    </FormItem>
  );
}
