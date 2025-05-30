import { expect, test } from 'bun:test'
import { parse } from '../src/index.js'
import { cases, TestCase } from './common.js'

function test_case({ name, text, data }: TestCase) {
  test(name, () => {
    expect(parse(text)).toEqual(data)
  })
}

cases.forEach(test_case)

test_case({ name: 'whitespaces', text: '\n\t  \n\n  ', data: [] })
test_case({
  name: 'no tag value => true',
  text: `Some text @flag`,
  data: [
    {
      title: '',
      text: 'Some text',
      description: '',
      tags: [{ name: 'flag', type: 'boolean', value: true }],
      items: [],
    },
  ],
})
