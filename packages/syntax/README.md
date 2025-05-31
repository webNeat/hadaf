# Hadaf Syntax

A library to parse and stringify Hadaf documents.

## The hadaf Syntax

I created the hadaf syntax to make it easy to write and manipulate todo documents. My goal was to have a simple text syntax that is easy to read and write, but also easy to parse and manipulate programmatically. Here is a tour of the syntax:

### A document is a list of items

When the following document is parsed:

```
Implement the hadaf syntax library
Write the tests
Write the documentation
```

It gives the following result:

```json
[
  {
    "text": "Implement the hadaf syntax library"
  },
  {
    "text": "Write the tests"
  },
  {
    "text": "Write the documentation"
  }
]
```

### Items can have tags

Let add some tags to the tasks:

```
Implement the hadaf syntax library @project:hadaf.syntax @coding
Write the tests @project:hadaf.syntax @testing @estimation:4h
Write the documentation @project:hadaf.syntax @writing @file:README.md
```

This will be parsed as:

```json
[
  {
    "text": "Implement the hadaf syntax library",
    "tags": [
      { "name": "project", "type": "text", "value": "hadaf.syntax" },
      { "name": "coding", "type": "boolean", "value": true }
    ]
  },
  {
    "text": "Write the tests",
    "tags": [
      { "name": "project", "type": "text", "value": "hadaf.syntax" },
      { "name": "testing", "type": "boolean", "value": true },
      { "name": "estimation", "type": "duration", "value": 240 }
    ]
  },
  {
    "text": "Write the documentation",
    "tags": [
      { "name": "project", "type": "text", "value": "hadaf.syntax" },
      { "name": "writing", "type": "boolean", "value": true },
      { "name": "file", "type": "text", "value": "README.md" }
    ]
  }
]
```

### Items can have sub-items

Let's add some sub-items to the first tasks:

```
Implement the hadaf syntax library @project:hadaf.syntax @coding
  Write the `parse` function @estimation:2h
  Write the `stringify` function @estimation:2h
```

This will be parsed as:

```json
[
  {
    "text": "Implement the hadaf syntax library",
    "tags": [
      { "name": "project", "type": "text", "value": "hadaf.syntax" },
      { "name": "coding", "type": "boolean", "value": true }
    ],
    "items": [
      {
        "text": "Write the `parse` function",
        "tags": [{ "name": "estimation", "type": "duration", "value": 120 }]
      },
      {
        "text": "Write the `stringify` function",
        "tags": [{ "name": "estimation", "type": "duration", "value": 120 }]
      }
    ]
  }
]
```

### Items can have a title

We can add a prefix to the item's text followed by a colon to make it a title, which is useful when combined with sub-items:

```
hadaf.syntax: @open-source
  Implement the hadaf syntax library
  Write the tests
  Write the documentation
```

This will be parsed as:

```json
[
  {
    "title": "hadaf.syntax",
    "tags": [{ "name": "open-source", "type": "boolean", "value": true }],
    "items": [
      {
        "text": "Implement the hadaf syntax library"
      },
      {
        "text": "Write the tests"
      },
      {
        "text": "Write the documentation"
      }
    ]
  }
]
```

### Supported tag types and values

- **boolean**: `@flag`, `@unwanted:false`, `@wanted:true`
- **number**: `@integer:123`, `@double:123.45`
- **duration**: `@duration-minutes:15m`, `@duration-hours:5h`, `@duration-both:2h15m`
- **date**: `@date:25/03/2024`, `@time:14h05`, `@datetime:15/07/2024_11h45`
- **list**: `@items:foo,bar,baz`
- **text**: Any other format is considered text, like `@project:hadaf.syntax`, `@file:README.md`
