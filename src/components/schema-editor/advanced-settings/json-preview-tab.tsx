import { useCallback, useEffect } from "react";
import { CodeMirrorJson } from "@/components/ui/code-mirror-json";
import { debounce } from "@/lib/schema/utils";

export function JsonPreviewTab({
  formSchema,
  setFormSchema,
}: {
  formSchema: Record<string, unknown> | undefined;
  setFormSchema: (schema: Record<string, unknown>) => void;
}) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleDebounce = useCallback(
    debounce(
      (callback: unknown) => {
        if (typeof callback === "function") callback();
      },
      300,
      { maxWait: 1000 }
    ),
    []
  );

  useEffect(() => {
    return () => handleDebounce.cancel();
  }, [handleDebounce]);

  return (
    <CodeMirrorJson
      className="col-span-6"
      value={JSON.stringify(formSchema || {}, null, 2)}
      editable
      height="300px"
      onChange={(value) => {
        handleDebounce(() => {
          if (value) {
            try {
              setFormSchema(JSON.parse(value));
            } catch {
              // ignore JSON parse errors while typing
            }
          }
        });
      }}
    />
  );
}
