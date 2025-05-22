# Goal

Add optional description to tasks. The chosen syntax is the following:

```
Some task @tag:value
  | description line 1
  | description line 2
  sub task @tag:value
```

When parsed, it gives the following result:
```json
[
  {
    "text": "Some task",
    "tags": [
      {"name": "tag", "type": "text", "value": "value"}
    ],
    "description": "description line 1\ndescription line 2",
    "items": [
      {
        "text": "sub task",
        "tags": [
          {"name": "tag", "type": "text", "value": "value"}
        ]
      }
    ]
  }
]
```

# Steps

- [ ] Update the parser
- [ ] Add tests for the parser
- [ ] Update the serializer
- [ ] Add tests for the serializer
