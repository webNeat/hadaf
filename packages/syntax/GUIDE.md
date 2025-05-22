# Hadaf Syntax Library Developer Guide

## Overview

The Hadaf Syntax library is a specialized parser and serializer for the Hadaf document format. It provides functionality to convert between a text-based format and a structured JavaScript/TypeScript object representation. The library is designed to be simple, efficient, and easy to use for managing todo-like documents with hierarchical structure and metadata.

## Project Structure

```
hadaf/packages/syntax/
├── dist/               # Compiled output (generated)
├── src/                # Source code
│   ├── Reader.ts       # Text reader utility for parsing
│   ├── env.ts          # Environment configuration
│   ├── index.ts        # Main entry point and exports
│   ├── parse.ts        # Document parsing logic
│   ├── parseValue.ts   # Tag value parsing logic
│   ├── stringify.ts    # Document serialization logic
│   ├── stringifyValue.ts # Tag value serialization logic
│   ├── tokens.ts       # Token definitions
│   └── types.ts        # Type definitions
├── tests/              # Test files
│   ├── parse.test.ts   # Tests for parsing functionality
│   ├── run.ts          # Test runner
│   └── stringify.test.ts # Tests for serialization functionality
├── build.sh            # Build script
├── package.json        # Package configuration
├── tsconfig.json       # TypeScript configuration
├── tsconfig.cjs.json   # CommonJS-specific TypeScript configuration
└── tsconfig.esm.json   # ESM-specific TypeScript configuration
```

## Core Concepts

### Document Structure

A Hadaf document consists of a list of items. Each item can have:

- **Title**: An optional identifier followed by a colon (e.g., `Project:`)
- **Text**: The main content of the item
- **Tags**: Metadata attached to the item, prefixed with `@` (e.g., `@priority:high`)
- **Sub-items**: Nested items, indented with spaces

### Data Model

The core data structures are defined in `types.ts`:

- **Document**: An array of `Item` objects
- **Item**: Contains title, text, tags, and sub-items
- **Tag**: Metadata with a name and typed value
- **TagData**: Different value types (text, boolean, number, duration, date, list, interval)

## Key Components

### Reader (Reader.ts)

A utility class that provides methods for reading and navigating through text during parsing. It maintains the current position and offers various methods for peeking, reading, and advancing through the text.

Key methods:
- `read(count)`: Read a specific number of characters
- `peek(count)`: Look ahead without advancing
- `readOne(...words)`: Read one of the specified words if present
- `readMany(...words)`: Read multiple occurrences of the specified words
- `readUntil(...words)`: Read until one of the specified words is encountered
- `isEnd()`: Check if the end of the text has been reached

### Parsing (parse.ts, parseValue.ts)

The parsing system converts text into a structured document:

- `parse(text)`: Main entry point for parsing a document
- `parseItem(reader)`: Parse a single item
- `parseTitle(reader)`: Extract the title part
- `parseText(reader)`: Extract the text content
- `parseTags(reader)`: Extract all tags
- `parseTag(reader)`: Parse a single tag
- `parseValue(text)`: Parse the value part of a tag (in parseValue.ts)

### Serialization (stringify.ts, stringifyValue.ts)

The serialization system converts a document back to text:

- `stringify(doc)`: Main entry point for serializing a document
- `stringifyItem(item, indentation)`: Serialize a single item
- `stringifyTag(tag)`: Serialize a single tag
- `stringifyValue(x)`: Serialize the value part of a tag (in stringifyValue.ts)

### Tokens (tokens.ts)

Defines the special characters and sequences used in the syntax:

- `new_line`: Line break characters
- `spaces`: Space characters
- `whitespace`: All whitespace characters
- `tag_start`: The '@' character that starts a tag
- `tag_separator`: The ':' character that separates tag name and value
- `title_end`: The ':' character that marks the end of a title
- `list_separator`: The ',' character that separates list items
- `interval_separator`: The '..' string that separates interval bounds

### Environment (env.ts)

Provides a way to customize the environment for the library, particularly for testing:

- `setEnv(overrides)`: Set custom environment values
- `resetEnv()`: Reset to default environment
- Default environment includes `getTime()` which returns the current time

## Tag Types and Values

The library supports various tag value types:

1. **Boolean**: 
   - Format: `@flag`, `@flag:true`, `@flag:false`
   - Example: `@completed`, `@important:true`, `@hidden:false`

2. **Number**: 
   - Format: `@tag:123`, `@tag:123.45`
   - Example: `@priority:1`, `@progress:0.75`

3. **Duration**: 
   - Format: `@tag:15m`, `@tag:2h`, `@tag:2h30m`
   - Example: `@estimation:4h`, `@spent:45m`
   - Stored as total minutes

4. **Date**: 
   - Format: `@tag:DD/MM/YYYY`, `@tag:HHhMM`, `@tag:DD/MM/YYYY_HHhMM`
   - Example: `@deadline:25/03/2024`, `@meeting:14h05`, `@start:15/07/2024_11h45`
   - Stored as timestamp (milliseconds)

5. **List**: 
   - Format: `@tag:item1,item2,item3`
   - Example: `@categories:work,personal,urgent`

6. **Text**: 
   - Format: `@tag:any-text`
   - Example: `@project:hadaf.syntax`, `@assignee:john`

## Usage Examples

### Parsing a Document

```typescript
import { parse } from '@hadaf/syntax';

const text = `
Project: @deadline:01/04/2024
  Task 1 @priority:1 @estimation:2h
    Subtask A @assigned:john
    Subtask B @assigned:jane
  Task 2 @priority:2 @estimation:4h
`;

const document = parse(text);
console.log(document);
```

### Serializing a Document

```typescript
import { stringify } from '@hadaf/syntax';

const document = [
  {
    title: 'Project',
    text: '',
    tags: [
      { name: 'deadline', type: 'date', value: new Date('2024-04-01').getTime() }
    ],
    items: [
      {
        title: '',
        text: 'Task 1',
        tags: [
          { name: 'priority', type: 'number', value: 1 },
          { name: 'estimation', type: 'duration', value: 120 }
        ],
        items: [
          {
            title: '',
            text: 'Subtask A',
            tags: [{ name: 'assigned', type: 'text', value: 'john' }],
            items: []
          },
          {
            title: '',
            text: 'Subtask B',
            tags: [{ name: 'assigned', type: 'text', value: 'jane' }],
            items: []
          }
        ]
      }
    ]
  }
];

const text = stringify(document);
console.log(text);
```

## Coding Conventions

1. **File Structure**:
   - Each file has a single responsibility
   - Files are named according to their primary export
   - Implementation details are kept private using TypeScript's private fields (`#property`)

2. **TypeScript Usage**:
   - Strong typing throughout the codebase
   - Explicit return types on functions
   - Interfaces and types defined in `types.ts`

3. **Module System**:
   - ES Modules with `.js` extension in imports (for TypeScript with "type": "module")
   - Dual package support (ESM and CommonJS) via package.json exports

4. **Testing**:
   - Tests use the Japa testing framework
   - Tests are organized by functionality (parse, stringify)
   - Environment can be customized for testing via `setEnv`/`resetEnv`

5. **Error Handling**:
   - Currently, the library focuses on the happy path and doesn't include extensive error handling

## Build System

The project uses a simple build system:

1. TypeScript compilation for both ESM and CommonJS formats
2. The build script (`build.sh`) handles the compilation process
3. The `prepublish` script ensures the package is built before publishing

## Extending the Library

### Adding a New Tag Type

1. Update `TagData` type in `types.ts`
2. Add parsing logic in `parseValue.ts`
3. Add serialization logic in `stringifyValue.ts`
4. Add tests in both `parse.test.ts` and `stringify.test.ts`

### Modifying the Document Structure

1. Update the relevant types in `types.ts`
2. Modify the parsing logic in `parse.ts`
3. Modify the serialization logic in `stringify.ts`
4. Update tests to reflect the new structure

## Performance Considerations

- The `Reader` class is designed for efficient parsing with minimal string copying
- Parsing is done in a single pass through the document
- The library avoids unnecessary object creation during parsing and serialization
