"use client";

import { json } from "@codemirror/lang-json";
import { linter, type Diagnostic } from "@codemirror/lint";
import CodeMirror, { type ReactCodeMirrorProps } from "@uiw/react-codemirror";
import { cn } from "@/lib/utils";

const jsonLinter = linter((view) => {
  const diagnostics: Diagnostic[] = [];
  const doc = view.state.doc.toString();
  if (!doc.trim()) return diagnostics;

  try {
    JSON.parse(doc);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid JSON";
    // Try to extract position from error message
    const match = message.match(/position (\d+)/);
    const pos = match ? parseInt(match[1], 10) : 0;
    diagnostics.push({
      from: Math.min(pos, doc.length),
      to: Math.min(pos + 1, doc.length),
      severity: "error",
      message,
    });
  }
  return diagnostics;
});

interface CodeMirrorJsonProps extends ReactCodeMirrorProps {
  className?: string;
}

export function CodeMirrorJson({
  className,
  extensions = [],
  ...props
}: CodeMirrorJsonProps) {
  return (
    <CodeMirror
      className={cn(
        "rounded-md border text-sm [&_.cm-editor]:outline-none [&_.cm-gutters]:border-r-0",
        className
      )}
      extensions={[json(), jsonLinter, ...extensions]}
      basicSetup={{
        lineNumbers: true,
        foldGutter: true,
        highlightActiveLine: false,
        bracketMatching: true,
        closeBrackets: true,
        indentOnInput: true,
      }}
      {...props}
    />
  );
}
