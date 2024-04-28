import { test } from '@japa/runner'
import { parse, Document, setEnv, resetEnv } from '../src/index.js'

test.group('parse', (group) => {
  const now = new Date('2024-03-10T10:00:00')
  group.setup(() => {
    setEnv({ getTime: () => now.getTime() })
  })
  group.teardown(() => {
    resetEnv()
  })

  test('empty document', ({ expect }) => {
    expect(parse('')).toEqual([])
    expect(parse('     ')).toEqual([])
    expect(
      parse(`
    
    `),
    ).toEqual([])
  })

  test('item with only title', ({ expect }) => {
    const text = 'hadaf.syntax:'
    const result: Document = [
      {
        title: 'hadaf.syntax',
        text: '',
        tags: [],
        items: [],
      },
    ]
    expect(parse(text)).toEqual(result)
  })

  test('item with only text', ({ expect }) => {
    const text = 'Implement the hadaf syntax library'
    const result: Document = [
      {
        title: '',
        text,
        tags: [],
        items: [],
      },
    ]
    expect(parse(text)).toEqual(result)
  })

  test('item with only tags', ({ expect }) => {
    const text = '@project:hadaf.syntax @coding'
    const result: Document = [
      {
        title: '',
        text: '',
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
    expect(parse(text)).toEqual(result)
  })

  test('item with title and tags', ({ expect }) => {
    const text = 'hadaf.syntax: @deadline:01/04/2024 @coding'
    const result: Document = [
      {
        title: 'hadaf.syntax',
        text: '',
        tags: [
          {
            name: 'deadline',
            type: 'date',
            value: new Date('2024-04-01 00:00:00.000').getTime(),
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
    expect(parse(text)).toEqual(result)
  })

  test('item with text and tags', ({ expect }) => {
    const text = 'Implement the hadaf syntax library @project:hadaf.syntax @coding'
    const result: Document = [
      {
        title: '',
        text: 'Implement the hadaf syntax library',
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
    expect(parse(text)).toEqual(result)
  })

  test('item with sub-items', ({ expect }) => {
    const text = 'Implement the hadaf syntax library\n  Write the `parse` function\n  Write the `stringify` function'
    const result: Document = [
      {
        title: '',
        text: 'Implement the hadaf syntax library',
        tags: [],
        items: [
          {
            title: '',
            text: 'Write the `parse` function',
            tags: [],
            items: [],
          },
          {
            title: '',
            text: 'Write the `stringify` function',
            tags: [],
            items: [],
          },
        ],
      },
    ]
    expect(parse(text)).toEqual(result)
  })

  test('item with sub-items and tags', ({ expect }) => {
    const text =
      'Implement the hadaf syntax library @project:hadaf.syntax\n  Write the `parse` function @estimation:2h\n  Write the `stringify` function @estimation:2h'
    const result: Document = [
      {
        title: '',
        text: 'Implement the hadaf syntax library',
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
            tags: [
              {
                name: 'estimation',
                type: 'duration',
                value: 120,
              },
            ],
            items: [],
          },
          {
            title: '',
            text: 'Write the `stringify` function',
            tags: [
              {
                name: 'estimation',
                type: 'duration',
                value: 120,
              },
            ],
            items: [],
          },
        ],
      },
    ]
    expect(parse(text)).toEqual(result)
  })

  test('deeply nested sub-items', ({ expect }) => {
    const text = `hadaf.syntax:
  Implement the hadaf syntax library @coding
    Write the parse function @code-parsing
    Write the stringify function @code-parsing
  Test that stuff @testing
`
    const result: Document = [
      {
        title: 'hadaf.syntax',
        text: '',
        tags: [],
        items: [
          {
            title: '',
            text: 'Implement the hadaf syntax library',
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
    expect(parse(text)).toEqual(result)
  })

  test('all tag types', ({ expect }) => {
    const text = `All tag types @flag @unwanted:false @wanted:true @integer:123 @double:123.45 @duration-minutes:15m @duration-hours:5h @duration-both:2h15m @date:25/03/2024 @time:10/03/2024_14h05 @datetime:15/07/2024_11h45 @items:foo,bar,baz @random-items:123,2h15m,15/03/2024_14h05,true @interval:10m..1h30m`
    const result: Document = [
      {
        title: '',
        text: 'All tag types',
        tags: [
          { name: 'flag', type: 'boolean', value: true },
          { name: 'unwanted', type: 'boolean', value: false },
          { name: 'wanted', type: 'boolean', value: true },
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
              { type: 'boolean', value: true },
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
    expect(parse(text)).toEqual(result)
  })
})
