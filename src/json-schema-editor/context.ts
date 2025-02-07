import { createContext } from "react";
import { JSONSchema7 } from "./types";

type EditorContextProps = {
  changeSchema?: (
    namePath: number[],
    value: any,
    propertyName?: string
  ) => void;
  renameProperty?: (namePath: number[], name: string) => void;
  removeProperty?: (namePath: number[]) => void;
  addProperty?: (path: number[], isChild: boolean) => void;
  updateRequiredProperty?: (
    path: number[],
    requiredProperty: string,
    removed: boolean
  ) => void;
  handleAdvancedSettingClick?: (
    namePath: number[],
    schema: JSONSchema7,
    propertyName?: string
  ) => boolean;
};

export const EditorContext = createContext<EditorContextProps>({});
