"use client";

import ReactCodeMirror, { BasicSetupOptions, ReactCodeMirrorProps } from '@uiw/react-codemirror'
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { linter, lintGutter } from '@codemirror/lint';
import clsx, { ClassValue } from 'clsx'
import React from 'react'

interface CodeMirrorJsonProps extends Omit<ReactCodeMirrorProps, "extensions" | "className" | "basicSetup"> {
  basicSetup?: BasicSetupOptions;
  className?: ClassValue;
}

export const CodeMirrorJson = React.forwardRef<HTMLDivElement, CodeMirrorJsonProps>(({ className, ...props }, ref) => {
  return (
    <div className={(clsx("border rounded-md overflow-hidden", className))} ref={ref}>
      <ReactCodeMirror
        indentWithTab
        extensions={[json(), linter(jsonParseLinter()), lintGutter()]}
        maxHeight="600px"
        lang="json"
        tabIndex={4}
        {...props}
        basicSetup={{
          allowMultipleSelections: true,
          tabSize: 4,
          indentOnInput: true,
          closeBrackets: true,
          bracketMatching: true,
          autocompletion: true,
          highlightActiveLine: true,
          ...props.basicSetup,
        }}
      />
    </div>
  )
})

CodeMirrorJson.displayName = "CodeMirrorJson"
