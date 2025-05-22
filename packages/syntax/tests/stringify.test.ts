import { test } from '@japa/runner'
import { Document, stringify } from '../src/index.js'

test.group('stringify', () => {
  test('empty document', ({ expect }) => {
    const doc: Document = []
    expect(stringify(doc)).toBe('')
  })

  test('item with only title', ({ expect }) => {
    const doc: Document = [
      {
        title: 'hadaf.syntax',
        text: '',
        description: '',
        tags: [],
        items: [],
      },
    ]
    expect(stringify(doc)).toBe('hadaf.syntax:')
  })

  test('item with only text', ({ expect }) => {
    const doc: Document = [
      {
        title: '',
        text: 'Implement the hadaf syntax library',
        description: '',
        tags: [],
        items: [],
      },
    ]
    expect(stringify(doc)).toBe('Implement the hadaf syntax library')
  })

  test('item with only tags', ({ expect }) => {
    const doc: Document = [
      {
        title: '',
        text: '',
        description: '',
        tags: [
          {
            name: 'project',
            type: 'text',
            value: 'hadaf.syntax',
          },
          {
            name: 'coding',
            type: 'boolean',
            value: true,
          },
        ],
        items: [],
      },
    ]
    expect(stringify(doc)).toBe('@project:hadaf.syntax @coding')
  })

  test('item with text and tags', ({ expect }) => {
    const doc: Document = [
      {
        title: '',
        text: 'Implement the hadaf syntax library',
        description: '',
        tags: [
          {
            name: 'project',
            type: 'text',
            value: 'hadaf.syntax',
          },
          {
            name: 'coding',
            type: 'boolean',
            value: true,
          },
        ],
        items: [],
      },
    ]
    expect(stringify(doc)).toBe('Implement the hadaf syntax library @project:hadaf.syntax @coding')
  })

  test('item with sub-items', ({ expect }) => {
    const doc: Document = [
      {
        title: '',
        text: 'Implement the hadaf syntax library',
        description: '',
        tags: [],
        items: [
          {
            title: '',
            text: 'Write the `parse` function',
            description: '',
            tags: [],
            items: [],
          },
          {
            title: '',
            text: 'Write the `stringify` function',
            description: '',
            tags: [],
            items: [],
          },
        ],
      },
    ]
    expect(stringify(doc)).toBe('Implement the hadaf syntax library\n  Write the `parse` function\n  Write the `stringify` function')
  })

  test('item with sub-items and tags', ({ expect }) => {
    const doc: Document = [
      {
        title: '',
        text: 'Implement the hadaf syntax library',
        description: '',
        tags: [
          {
            name: 'project',
            type: 'text',
            value: 'hadaf.syntax',
          },
        ],
        items: [
          {
            title: '',
            text: 'Write the `parse` function',
            description: '',
            tags: [],
            items: [],
          },
          {
            title: '',
            text: 'Write the `stringify` function',
            description: '',
            tags: [],
            items: [],
          },
        ],
      },
    ]
    expect(stringify(doc)).toBe('Implement the hadaf syntax library @project:hadaf.syntax\n  Write the `parse` function\n  Write the `stringify` function')
  })

  test('deeply nested sub-items', ({ expect }) => {
    const doc: Document = [
      {
        title: 'hadaf.syntax',
        text: '',
        description: '',
        tags: [],
        items: [
          {
            title: '',
            text: 'Implement the hadaf syntax library',
            description: '',
            tags: [
              {
                name: 'coding',
                type: 'boolean',
                value: true,
              },
            ],
            items: [
              {
                title: '',
                text: 'Write the parse function',
                description: '',
                tags: [
                  {
                    name: 'code-parsing',
                    type: 'boolean',
                    value: true,
                  },
                ],
                items: [],
              },
              {
                title: '',
                text: 'Write the stringify function',
                description: '',
                tags: [
                  {
                    name: 'code-parsing',
                    type: 'boolean',
                    value: true,
                  },
                ],
                items: [],
              },
            ],
          },
          {
            title: '',
            text: 'Test that stuff',
            description: '',
            tags: [
              {
                name: 'testing',
                type: 'boolean',
                value: true,
              },
            ],
            items: [],
          },
        ],
      },
    ]
    expect(stringify(doc)).toBe(
      'hadaf.syntax:\n  Implement the hadaf syntax library @coding\n    Write the parse function @code-parsing\n    Write the stringify function @code-parsing\n  Test that stuff @testing',
    )
  })

  test('all tag types', ({ expect }) => {
    const doc: Document = [
      {
        title: '',
        text: 'All tag types',
        description: '',
        tags: [
          { name: 'flag', type: 'boolean', value: true },
          { name: 'unwanted', type: 'boolean', value: false },
          { name: 'integer', type: 'number', value: 123 },
          { name: 'double', type: 'number', value: 123.45 },
          { name: 'duration-minutes', type: 'duration', value: 15 },
          { name: 'duration-hours', type: 'duration', value: 5 * 60 },
          { name: 'duration-both', type: 'duration', value: 2 * 60 + 15 },
          { name: 'date', type: 'date', value: new Date('2024-03-25 00:00:00.000').getTime() },
          { name: 'time', type: 'date', value: new Date('2024-03-10 14:05:00.000').getTime() },
          { name: 'datetime', type: 'date', value: new Date('2024-07-15 11:45:00.000').getTime() },
          {
            name: 'items',
            type: 'list',
            value: [
              { type: 'text', value: 'foo' },
              { type: 'text', value: 'bar' },
              { type: 'text', value: 'baz' },
            ],
          },
          {
            name: 'random-items',
            type: 'list',
            value: [
              { type: 'number', value: 123 },
              { type: 'duration', value: 2 * 60 + 15 },
              { type: 'date', value: new Date('2024-03-15 14:05:00.000').getTime() },
            ],
          },
          {
            name: 'interval',
            type: 'interval',
            value: [
              { type: 'duration', value: 10 },
              { type: 'duration', value: 60 + 30 },
            ],
          },
        ],
        items: [],
      },
    ]
    expect(stringify(doc)).toEqual(
      `All tag types @flag @unwanted:false @integer:123 @double:123.45 @duration-minutes:15m @duration-hours:5h @duration-both:2h15m @date:25/03/2024 @time:10/03/2024_14h05 @datetime:15/07/2024_11h45 @items:foo,bar,baz @random-items:123,2h15m,15/03/2024_14h05 @interval:10m..1h30m`,
    )
  })
})
