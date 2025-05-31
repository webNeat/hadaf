import _ from 'dedent'
import { Document } from '../src/types.js'

export type TestCase = {
  name: string
  text: string
  data: Document
}

export const cases: TestCase[] = []
function t(name: string, text: string, data: Document) {
  cases.push({ name, text, data })
}

t('empty document', '', [])

t('item with only title', 'hadaf.syntax:', [
  {
    title: 'hadaf.syntax',
    text: '',
    tags: [],
    items: [],
    description: '',
  },
])

t('item with only text', 'Implement the hadaf syntax library', [
  {
    title: '',
    text: 'Implement the hadaf syntax library',
    tags: [],
    items: [],
    description: '',
  },
])

t('item with only tags', '@project:hadaf.syntax @coding:true', [
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
])

t('item with title and tags', 'hadaf.syntax: @deadline:01/04/2024 @coding:true', [
  {
    title: 'hadaf.syntax',
    text: '',
    description: '',
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
])

t('item with text and tags', 'Implement the hadaf syntax library @project:hadaf.syntax @coding:true', [
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
])

t(
  'item with sub-items',
  _`
    Implement the hadaf syntax library
      Write the \`parse\` function
      Write the \`stringify\` function
  `,
  [
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
  ],
)

t(
  'item with sub-items and tags',
  _`
    Implement the hadaf syntax library @project:hadaf.syntax
      Write the \`parse\` function @estimation:2h
      Write the \`stringify\` function @estimation:2h
  `,
  [
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
          description: '',
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
  ],
)

t(
  'deeply nested sub-items',
  _`
    hadaf.syntax:
      Implement the hadaf syntax library @coding:true
        Write the parse function @code-parsing:true
        Write the stringify function @code-parsing:true
      Test that stuff @testing:true
  `,
  [
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
  ],
)
t(
  'all tag types',
  `All tag types @unwanted:false @wanted:true @integer:123 @double:123.45 @duration-minutes:15m @duration-hours:5h @duration-both:2h15m @date:25/03/2024 @time:10/03/2024_14h05 @datetime:15/07/2024_11h45 @items:foo,bar,baz @random-items:123,2h15m,15/03/2024_14h05,true @interval:10m..1h30m`,
  [
    {
      title: '',
      text: 'All tag types',
      description: '',
      tags: [
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
  ],
)
