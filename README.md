# JSON Schema Editor

A modern, highly performant visual editor for JSON Schema Draft 07, built with React, Next.js, and Zustand.

## Overview

JSON Schema Editor is a powerful tool to visually build, edit, and validate JSON Schema documents. It abstracts away the raw JSON representation and provides an intuitive, recursive tree UI to manage complex object structures, arrays, and field validations.

Originally inspired by `json-schema-editor-antd`, this iteration is a ground-up rewrite using a modern tech stack centered exclusively on clean state management, modular component composition, and responsive styling.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Library**: React 19
- **State Management**: Zustand
- **Validation**: Zod (v4)
- **UI Components**: shadcn/ui + base-ui primitives
- **Styling**: Tailwind CSS 4.0
- **Editor**: CodeMirror 5 (via `@uiw/react-codemirror`)
- **Package Manager**: pnpm

## Key Features

- **Visual Tree Builder**: Create deeply nested arrays and objects intuitively without touching raw JSON.
- **Advanced Validation Controls**: Full support for JSON Schema Draft 07 attributes (e.g., Min/Max values, RegEx Patterns, UniqueItems, and Enums).
- **Two-way Syncing**: Make changes in the UI and instantly see the clean JSON output.
- **Import / Export**: 
  - Import external JSON Data (auto-inference) or existing JSON Schema documents.
  - Quick paste from the clipboard.
  - One-click copy or download (`schema.json`).
- **Modern UI/UX**: Designed for responsiveness, leveraging scalable glassmorphism, resizable panels (`react-resizable-panels`), and toast notifications (`sonner`).

## Development

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to start editing.

## File Structure Highlights

- `src/app/page.tsx` - Main layout supporting responsive stacked/resizable split views.
- `src/components/schema-editor/schema-tree/` - Core recursive editor components handling tree traversal, row states, and user actions.
- `src/components/schema-editor/advanced-settings/` - Modular tabbed interfaces to manage type-specific JSON Schema constraints.
- `src/lib/schema/store.ts` - Centralized Zustand schema state.
- `src/lib/schema/validation.ts` - Recursive Zod 4 JSON Schema validation.
- `src/lib/schema/utils.ts` - Broad utilities for inferring schemas and processing recursive references.

## Testing

This project utilizes `vitest` for reliable, fast unit testing of schema parsers and utility functions.

```bash
pnpm test
```

## Building for Production

Compile a static or optimized bundle of the application using Turbopack:

```bash
pnpm run build
pnpm start
```
