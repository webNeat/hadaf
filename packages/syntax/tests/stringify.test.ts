import { expect, test } from 'bun:test'
import { stringify } from '../src/index.js'
import { cases, TestCase } from './common.js'

function test_case({ name, text, data }: TestCase) {
  test(name, () => {
    expect(stringify(data)).toEqual(text)
  })
}

cases.forEach(test_case)
