import { useEffect, useMemo, useRef } from "react";

export function useCallbackRef(callback: (...args: any) => any) {
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  });
  return useMemo(
    () =>
      (...args: any) =>
        callbackRef.current?.(...args),
    []
  );
}
