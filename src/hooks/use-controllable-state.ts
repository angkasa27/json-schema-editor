import { useCallback, useEffect, useRef, useState } from "react";
import { useCallbackRef } from "./use-callback-ref";

interface useControllableStateProps<T> {
  prop?: T;
  defaultProp: T;
  onChange?: (state: T) => void;
}

type returnType<T> = [T | undefined, (state: T) => void];

export function useControllableState<T>({
  prop,
  defaultProp,
  onChange = () => {},
}: useControllableStateProps<T>): returnType<T> {
  const [uncontrolledProp, setUncontrolledProp] = useUncontrolledState({
    defaultProp,
    onChange,
  });
  const isControlled = prop !== void 0;
  const value = isControlled ? prop : uncontrolledProp;
  const handleChange = useCallbackRef(
    onChange
  );
  const setValue = useCallback(
    (nextValue: any) => {
      if (isControlled) {
        const setter = nextValue;
        const value2 =
          typeof nextValue === "function" ? setter(prop) : nextValue;
        if (value2 !== prop) handleChange(value2);
      } else {
        setUncontrolledProp(nextValue);
      }
    },
    [isControlled, prop, setUncontrolledProp, handleChange]
  );
  return [value, setValue];
}

interface useUncontrollableStateProps<T> {
  defaultProp?: T;
  onChange: (state: T) => void;
}

type useUncontrollableStateValue<T> = [T | undefined, (state: T) => void];

export function useUncontrolledState<T>({ defaultProp, onChange }:useUncontrollableStateProps<T>):useUncontrollableStateValue<T> {
  const uncontrolledState = useState(defaultProp);
  const [value] = uncontrolledState;
  const prevValueRef = useRef(value);
  const handleChange = useCallbackRef(
    onChange
  );
  useEffect(() => {
    if (prevValueRef.current !== value) {
      handleChange(value);
      prevValueRef.current = value;
    }
  }, [value, prevValueRef, handleChange]);
  return uncontrolledState;
}
