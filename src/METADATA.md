# Package Metadata Module

A Node.js module inspired by Rust's `cargo metadata` command, providing structured metadata about the current package and its dependencies.

## Overview

This module reads `package.json` and `package-lock.json` to provide comprehensive metadata about your Node.js project in a structured JSON format. It's useful for build tools, CI/CD pipelines, and any automation that needs to inspect package information.

## Features

- 📦 **Package Information**: Name, version, description, license, author, etc.
- 📚 **Dependency Analysis**: Lists both production and development dependencies
- 🔍 **Version Resolution**: Shows resolved versions from package-lock.json
- 🗂️ **Workspace Info**: Provides root directory and node_modules location
- 📄 **JSON Output**: Clean, structured JSON output similar to cargo metadata
- 🚀 **CLI Support**: Can be run directly from command line
- 🧪 **Tested**: Includes comprehensive test suite

## Installation

The metadata module is included in the project. No additional dependencies are required beyond Node.js built-in modules (`fs`, `path`).

## Usage

### Command Line

Get raw JSON metadata output:
```bash
npm run metadata
```

See a formatted example with explanations:
```bash
npm run metadata:demo
```

Export metadata to a file:
```bash
npm run metadata > metadata.json
```

### Programmatic Usage

```javascript
const PackageMetadata = require('./src/metadata');

// Create a metadata instance
const metadata = new PackageMetadata();

// Get metadata object
const data = metadata.getMetadata();
console.log('Package:', data.package.name);
console.log('Dependencies:', data.dependencies.length);

// Get as JSON string
const json = metadata.toJSON();
console.log(json);
```

### With Custom Root Path

```javascript
const PackageMetadata = require('./src/metadata');

// Specify a custom path
const metadata = new PackageMetadata('/path/to/project');
const data = metadata.getMetadata();
```

## Output Format

The metadata output follows this structure:

```json
{
  "package": {
    "name": "package-name",
    "version": "1.0.0",
    "description": "Package description",
    "license": "ISC",
    "author": "Author Name",
    "homepage": "https://example.com",
    "repository": {
      "type": "git",
      "url": "git+https://github.com/user/repo.git"
    },
    "main": "index.js",
    "type": "commonjs",
    "keywords": [],
    "scripts": {
      "test": "node test.js"
    }
  },
  "dependencies": [
    {
      "name": "package-name",
      "version": "^1.0.0",
      "type": "dependency",
      "resolved": "1.0.5"
    }
  ],
  "workspace_root": "/path/to/project",
  "target_directory": "/path/to/project/node_modules",
  "metadata_version": "1.0.0"
}
```

## API Reference

### `PackageMetadata(rootPath)`

Constructor for creating a metadata instance.

**Parameters:**
- `rootPath` (string, optional): Path to the project root. Defaults to `process.cwd()`

**Example:**
```javascript
const metadata = new PackageMetadata();
// or
const metadata = new PackageMetadata('/custom/path');
```

### `metadata.readPackageJson()`

Reads and parses the package.json file.

**Returns:** `object` - Parsed package.json data

**Throws:** `Error` if package.json doesn't exist or is invalid

### `metadata.readPackageLock()`

Reads and parses the package-lock.json file if it exists.

**Returns:** `object|null` - Parsed package-lock.json data or null if not found

### `metadata.getMetadata()`

Retrieves complete package metadata.

**Returns:** `object` - Complete metadata object with package info, dependencies, and workspace info

### `metadata.toJSON(indent)`

Returns metadata as a formatted JSON string.

**Parameters:**
- `indent` (number, optional): Number of spaces for indentation. Defaults to 2

**Returns:** `string` - Formatted JSON string

**Example:**
```javascript
const json = metadata.toJSON();
console.log(json);

// Custom indentation
const compactJson = metadata.toJSON(0);
```

## Dependency Information

Each dependency in the output includes:

- `name`: Package name
- `version`: Version specifier from package.json (e.g., "^1.0.0")
- `type`: Either "dependency" or "devDependency"
- `resolved`: Actual installed version from package-lock.json (or null if not found)

## Testing

Run the test suite:
```bash
node src/metadata.test.js
```

The test suite validates:
- Metadata instance creation
- package.json reading
- package-lock.json reading (optional)
- Complete metadata retrieval
- JSON output generation
- Dependency extraction
- Version resolution

## Use Cases

- **Build Scripts**: Extract version and dependencies for build processes
- **CI/CD Pipelines**: Validate dependencies before deployment
- **Documentation**: Auto-generate dependency documentation
- **Auditing**: Track package dependencies over time
- **Tooling**: Create custom development tools that need package information

## Comparison to Cargo Metadata

This module is inspired by Rust's `cargo metadata` command and provides similar functionality for Node.js projects:

| Feature | cargo metadata | This Module |
|---------|---------------|-------------|
| Package info | ✅ | ✅ |
| Dependencies | ✅ | ✅ |
| JSON output | ✅ | ✅ |
| CLI support | ✅ | ✅ |
| Resolved versions | ✅ | ✅ |
| Workspace info | ✅ | ✅ |

## License

ISC

## Author

Matthew Brace (kushmanmb)
- Email: mattbrace92@gmail.com
- Website: https://kushmanmb.org
- ENS: kushmanmb.base.eth

---

**© 2024-2026 Matthew Brace (kushmanmb) | All Rights Reserved**
