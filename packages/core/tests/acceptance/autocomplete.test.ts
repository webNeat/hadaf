import fs from 'fs/promises'
import { test } from '@japa/runner'
import { parse } from '@hadaf/syntax'
import { unindent } from './utils.js'
import { createHandler } from '../../src/index.js'

type TestCase = {
  data: string
  text: string
  suggestions: string[]
}

const dbPath = 'tests/db.json'
const data = `
  Task 1 @id:1 @project:foo @duration:15m @deadline:10h00
  Task 2 @id:2 @project:bar @duration:2h30m @deadline:10h30
    Subtask 1 @id:3 @parent:2 @project:bar.baz @est:1h
    Subtask 2 @id:4 @parent:2 @project:bar.baz @est:1h15m
`

test.group('acceptance > autocomplete: when the database is empty', (group) => {
  group.each.setup(() => {
    return () => fs.unlink(dbPath)
  })
  testCase('it autocompletes operations', {
    data: '',
    text: '',
    suggestions: ['filter: ', 'sort: ', 'defaults: ', 'apply: ', 'groupBy: '],
  })
  testCase('it gives no tag names', {
    data: '',
    text: 'Some task @',
    suggestions: [],
  })
  testCase('it gives no tag values', {
    data: '',
    text: 'Some task @project:',
    suggestions: [],
  })
})

test.group('acceptance > autocomplete: when there is data on the database', (group) => {
  group.each.setup(() => {
    return () => fs.unlink(dbPath)
  })
  testCase('it autocompletes operations', {
    data,
    text: '',
    suggestions: ['filter: ', 'sort: ', 'defaults: ', 'apply: ', 'groupBy: '],
  })
  testCase('it suggests tag names after space', {
    data,
    text: 'Some task ',
    suggestions: ['@id', '@parent', '@project', '@deadline', '@est', '@duration'],
  })
  testCase('it suggests tag names after "@"', {
    data,
    text: '  Some task @',
    suggestions: ['id', 'parent', 'project', 'deadline', 'est', 'duration'],
  })
  testCase('it suggests tag values', {
    data,
    text: 'Some task @project:',
    suggestions: ['foo', 'bar', 'bar.baz'],
  })
})

test.group('acceptance > autocomplete > apply operation', (group) => {
  group.each.setup(() => {
    return () => fs.unlink(dbPath)
  })
  testCase('suggests tags after space', {
    data,
    text: 'apply: ',
    suggestions: ['@id', '@parent', '@project', '@deadline', '@est', '@duration'],
  })
  testCase('suggests tags after "@"', {
    data,
    text: 'apply: @',
    suggestions: ['id', 'parent', 'project', 'deadline', 'est', 'duration'],
  })
  testCase(`doesn't include already existing tags`, {
    data,
    text: 'apply: @project:foo ',
    suggestions: ['@id', '@parent', '@deadline', '@est', '@duration'],
  })
  testCase('suggests tag values after ":"', {
    data,
    text: 'apply: @project:',
    suggestions: ['foo', 'bar', 'bar.baz'],
  })
})

test.group('acceptance > autocomplete > defaults operation', (group) => {
  group.each.setup(() => {
    return () => fs.unlink(dbPath)
  })
  testCase('suggests tags after space', {
    data,
    text: 'defaults: ',
    suggestions: ['@id', '@parent', '@project', '@deadline', '@est', '@duration'],
  })
  testCase('suggests tags after "@"', {
    data,
    text: 'defaults: @',
    suggestions: ['id', 'parent', 'project', 'deadline', 'est', 'duration'],
  })
  testCase(`doesn't include already existing tags`, {
    data,
    text: 'defaults: @project:foo ',
    suggestions: ['@id', '@parent', '@deadline', '@est', '@duration'],
  })
  testCase('suggests tag values after ":"', {
    data,
    text: 'defaults: @project:',
    suggestions: ['foo', 'bar', 'bar.baz'],
  })
})

test.group('acceptance > autocomplete > filter operation', (group) => {
  group.each.setup(() => {
    return () => fs.unlink(dbPath)
  })
  testCase('suggests tags after space', {
    data,
    text: 'filter: ',
    suggestions: ['@id', '@parent', '@project', '@deadline', '@est', '@duration', '@id!', '@parent!', '@project!', '@deadline!', '@est!', '@duration!'],
  })
  testCase('suggests tags after "@"', {
    data,
    text: 'filter: @',
    suggestions: ['id', 'parent', 'project', 'deadline', 'est', 'duration', 'id!', 'parent!', 'project!', 'deadline!', 'est!', 'duration!'],
  })
  testCase(`doesn't include already existing tags`, {
    data,
    text: 'filter: @project:foo ',
    suggestions: ['@id', '@parent', '@deadline', '@est', '@duration', '@id!', '@parent!', '@deadline!', '@est!', '@duration!'],
  })
  testCase('suggests tag values after ":"', {
    data,
    text: 'filter: @project:',
    suggestions: ['foo', 'bar', 'bar.baz'],
  })
  testCase('suggests tag values after "!:"', {
    data,
    text: 'filter: @project!:',
    suggestions: ['foo', 'bar', 'bar.baz'],
  })
})

test.group('acceptance > autocomplete > groupBy operation', (group) => {
  group.each.setup(() => {
    return () => fs.unlink(dbPath)
  })
  testCase('suggests tags after space', {
    data,
    text: 'groupBy: ',
    suggestions: ['@id', '@parent', '@project', '@deadline', '@est', '@duration'],
  })
  testCase('suggests tags after "@"', {
    data,
    text: 'groupBy: @',
    suggestions: ['id', 'parent', 'project', 'deadline', 'est', 'duration'],
  })
  testCase(`doesn't include already existing tags`, {
    data,
    text: 'groupBy: @project ',
    suggestions: ['@id', '@parent', '@deadline', '@est', '@duration'],
  })
  testCase('suggests sort values after ":"', {
    data,
    text: 'groupBy: @project:',
    suggestions: ['asc', 'desc'],
  })
})

test.group('acceptance > autocomplete > sort operation', (group) => {
  group.each.setup(() => {
    return () => fs.unlink(dbPath)
  })
  testCase('suggests tags after space', {
    data,
    text: 'sort: ',
    suggestions: ['@id', '@parent', '@project', '@deadline', '@est', '@duration'],
  })
  testCase('suggests tags after "@"', {
    data,
    text: 'sort: @',
    suggestions: ['id', 'parent', 'project', 'deadline', 'est', 'duration'],
  })
  testCase(`doesn't include already existing tags`, {
    data,
    text: 'sort: @project:asc ',
    suggestions: ['@id', '@parent', '@deadline', '@est', '@duration'],
  })
  testCase('suggests sort values after ":"', {
    data,
    text: 'sort: @project:',
    suggestions: ['asc', 'desc'],
  })
})

function testCase(name: string, { data, text, suggestions }: TestCase) {
  return test(name, async ({ expect }) => {
    const handler = createHandler({ dbPath })
    const dbItems = await handler.db.createDbItems(parse(unindent(data).trim()))
    await handler.db.save(dbItems)
    const res = await handler.autocomplete(text)
    res.sort()
    suggestions.sort()
    expect(res).toEqual(suggestions)
  })
}
