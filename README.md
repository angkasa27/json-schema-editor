# JSON Schema Editor (React + TailwindCSS + React Hook Form)

## Overview

This project is a JSON Schema Editor based on React. It allows users to visualize and edit the structure of a JSON schema without manually modifying the JSON code. By providing an intuitive interface, users can interact with JSON schemas more efficiently and reduce the chances of errors.

This project is a modified version of [json-schema-editor-antd](https://github.com/lin-mt/json-schema-editor-antd). The original project is built using Ant Design (antd), while this modified version replaces Ant Design components with TailwindCSS for styling and React Hook Form for form management. This ensures a more modern UI framework with a flexible and reactive form handling experience.

## Features

- 🖼 **Visual Schema Representation** – Easily view and edit JSON schema structures without dealing with raw JSON code.
- 🎨 **TailwindCSS** – Lightweight styling with utility-first CSS.
- 🔄 **React Hook Form** – Efficient form management with minimal re-renders.
- 🛠 **Customizable** – Extend and adapt the editor for different schema requirements.
- ⚛ **React-Based** – Built on a modern React architecture.

## Installation

Since the package is not yet published on npm, you can clone the repository and install dependencies manually:

```bash
git clone https://github.com/angkasa27/json-schema-editor.git
cd json-schema-editor
npm install
```

## Usage

Here’s how you can use the JSON Schema Editor component in your React project:

```jsx
import JsonSchemaEditor from "@/json-schema-editor";
import { JSONSchema7 } from "@/json-schema-editor/types";
import { useState } from "react";

const App = () =>{
  const [jsonSchema, setJsonSchema] = useState<JSONSchema7>();

  return (
    <div className="p-3">
      <JsonSchemaEditor
        data={jsonSchema}
        onSchemaChange={(v) => setJsonSchema(v)}
      />
    </div>
  );
}

export default App;
```

## Props

| Prop Name        | Type     | Description                                             |
| ---------------- | -------- | ------------------------------------------------------- |
| `onSchemaChange` | Function | Callback function triggered when the schema is updated. |
| `data`           | Object   | The current JSON schema object.                         |

## Development

### Clone the Repository

```bash
git clone https://github.com/angkasa27/json-schema-editor.git
cd json-schema-editor
```

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm start
```

### Build for Production

```bash
npm run build
```

## Contributing

Contributions are welcome! Feel free to submit issues, feature requests, or pull requests.

---

If you have any questions or need further clarification, feel free to reach out!
