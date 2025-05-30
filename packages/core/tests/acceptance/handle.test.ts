import dedent from 'dedent'
import { afterEach, describe, expect, test } from 'bun:test'
import { parse, stringify } from '@hadaf/syntax'
import { createHandler } from '../../src/index.js'

type TestCase = {
  data: string
  input: string
  output: string
  stableOutput?: boolean
}

const dbPath = 'tests/db.json'

describe('acceptance > handle: when the input string is empty', () => {
  afterEach(() => Bun.file(dbPath).delete())

  testCase('it returns empty string when the db is empty', {
    data: '',
    input: '',
    output: '',
  })
  testCase('it lists all items in the db', {
    data: `
      A task without title nor tags @id:1
      test_title: A task with title but no tags @id:2
      A task without title but with tags @id:3 @fun:true @deadline:15/04/2024 @est:1h15m
    `,
    input: '',
    output: `
      A task without title nor tags @id:1
      test_title: A task with title but no tags @id:2
      A task without title but with tags @id:3 @fun:true @deadline:15/04/2024 @est:1h15m
    `,
    stableOutput: true,
  })
})

describe('acceptance > handle: when the input string contains only items', () => {
  afterEach(() => Bun.file(dbPath).delete())
  testCase('it inserts new items', {
    data: `An already existing task @id:1 @test`,
    input: `A new task @new`,
    output: `
      An already existing task @id:1 @test:true
      A new task @id:2 @new:true
    `,
    stableOutput: true,
  })
  testCase('it updates existing items', {
    data: `An already existing task @id:1 @test`,
    input: `Updating the already existing task @id:1 @updated`,
    output: `Updating the already existing task @id:1 @updated:true`,
  })
  testCase('it deletes items with @delete tag', {
    data: `An already existing task @id:1 @test`,
    input: 'An already existing task @id:1 @test @delete',
    output: '',
  })
  testCase('overrides tags with the same name with the last one', {
    data: `An already existing task @id:1 @project:test @fun`,
    input: `An already existing task @id:1 @project:test @fun:true @project:demo`,
    output: `An already existing task @id:1 @project:demo @fun:true`,
  })
  testCase('it adds tasks and subtasks', {
    data: '',
    input: `
      A task
        A subtask
        Another subtask
      A second task
    `,
    output: `
      A task @id:1
        A subtask @id:2 @parent:1
        Another subtask @id:3 @parent:1
      A second task @id:4
    `,
  })
  testCase('it adds subtasks to existing tasks', {
    data: `
      A task @id:1
    `,
    input: `
      A task @id:1
        A subtask
    `,
    output: `
      A task @id:1
        A subtask @id:2 @parent:1
    `,
  })
  testCase('it moves subtasks between tasks', {
    data: `
      A task 1 @id:1
        A subtask @id:4 @parent:1
      A task 2 @id:2
        Another subtask @id:5 @parent:2
        Yet another subtask @id:6 @parent:2
      A task 3 @id:3
    `,
    input: `
      A task 1 @id:1
      A task 2 @id:2
        Another subtask @id:5 @parent:2
      A task 3 @id:3
        A subtask @id:4 @parent:1
      Yet another subtask @id:6 @parent:2
    `,
    output: `
      A task 1 @id:1
      A task 2 @id:2
        Another subtask @id:5 @parent:2
      A task 3 @id:3
        A subtask @id:4 @parent:3
      Yet another subtask @id:6
        `,
    stableOutput: true,
  })
  testCase('it deletes subtasks when the parent task is deleted', {
    data: `
      A task @id:1
        A subtask @id:2 @parent:1
        Another subtask @id:3 @parent:1
      A second task @id:4
    `,
    input: 'A task @id:1 @delete',
    output: 'A second task @id:4',
  })
})

describe('acceptance > handle: sort', () => {
  afterEach(() => Bun.file(dbPath).delete())
  testCase('it sorts items ASC with one tag', {
    data: `
      Task 1 @id:1 @fun:true @duration:1h
      Task 2 @id:2 @serious:true @duration:25m
      Task 3 @id:3 @project:other
      Task 4 @id:4 @project:demo @duration:30m
    `,
    input: `
      sort: @duration:asc
      ---
    `,
    output: `
      sort: @duration:asc
      ---
      Task 2 @id:2 @serious:true @duration:25m
      Task 4 @id:4 @project:demo @duration:30m
      Task 1 @id:1 @fun:true @duration:1h
      Task 3 @id:3 @project:other
    `,
    stableOutput: true,
  })
  testCase('it sorts items DESC with one tag', {
    data: `
      Task 1 @id:1 @fun:true @duration:1h
      Task 2 @id:2 @serious:true @duration:25m
      Task 3 @id:3 @project:other
      Task 4 @id:4 @project:demo @duration:30m
    `,
    input: `
      sort: @duration:desc
      ---
    `,
    output: `
      sort: @duration:desc
      ---
      Task 1 @id:1 @fun:true @duration:1h
      Task 4 @id:4 @project:demo @duration:30m
      Task 2 @id:2 @serious:true @duration:25m
      Task 3 @id:3 @project:other
    `,
    stableOutput: true,
  })
  testCase('it sorts items with multiple tags', {
    data: `
      Task 1 @id:1 @fun:true @duration:1h
      Task 2 @id:2 @serious:true @duration:25m
      Task 3 @id:3 @project:other
      Task 4 @id:4 @project:demo @duration:30m
      Task 5 @id:5 @duration:25m
      Task 6 @id:6 @duration:30m
    `,
    input: `
      sort: @duration:asc @id:desc
      ---
    `,
    output: `
      sort: @duration:asc @id:desc
      ---
      Task 5 @id:5 @duration:25m
      Task 2 @id:2 @serious:true @duration:25m
      Task 6 @id:6 @duration:30m
      Task 4 @id:4 @project:demo @duration:30m
      Task 1 @id:1 @fun:true @duration:1h
      Task 3 @id:3 @project:other
    `,
    stableOutput: true,
  })
})

describe('acceptance > handle: filter', () => {
  afterEach(() => Bun.file(dbPath).delete())
  testCase('@tag:value => where tag equals value', {
    data: `
      Task 1 @id:1 @fun:true @duration:1h
      Task 2 @id:2 @serious:true @duration:25m
      Task 3 @id:3 @project:other
      Task 4 @id:4 @project:demo @duration:30m
    `,
    input: `
      filter: @duration:30m
      ---
    `,
    output: `
      filter: @duration:30m
      ---
      Task 4 @id:4 @project:demo @duration:30m
    `,
    stableOutput: true,
  })
  testCase('@tag!:value => where tag does not equal value', {
    data: `
      Task 1 @id:1 @fun:true @duration:1h
      Task 2 @id:2 @serious:true @duration:25m
      Task 3 @id:3 @project:other
      Task 4 @id:4 @project:demo @duration:30m
    `,
    input: `
      filter: @duration!:30m
      ---
    `,
    output: `
      filter: @duration!:30m
      ---
      Task 1 @id:1 @fun:true @duration:1h
      Task 2 @id:2 @serious:true @duration:25m
      Task 3 @id:3 @project:other
    `,
    stableOutput: true,
  })
  testCase('@tag:a..b => where tag between a and b', {
    data: `
      Task 1 @id:1 @fun:true @duration:1h
      Task 2 @id:2 @serious:true @duration:25m
      Task 3 @id:3 @project:other
      Task 4 @id:4 @project:demo @duration:30m
    `,
    input: `
      filter: @duration:25m..1h
      ---
    `,
    output: `
      filter: @duration:25m..1h
      ---
      Task 1 @id:1 @fun:true @duration:1h
      Task 2 @id:2 @serious:true @duration:25m
      Task 4 @id:4 @project:demo @duration:30m
    `,
    stableOutput: true,
  })
  testCase('@tag!:a..b => where tag is not between a and b', {
    data: `
      Task 1 @id:1 @fun:true @duration:1h
      Task 2 @id:2 @serious:true @duration:25m
      Task 3 @id:3 @project:other
      Task 4 @id:4 @project:demo @duration:30m
    `,
    input: `
      filter: @duration!:25m..30m
      ---
    `,
    output: `
      filter: @duration!:25m..30m
      ---
      Task 1 @id:1 @fun:true @duration:1h
      Task 3 @id:3 @project:other
    `,
    stableOutput: true,
  })
  testCase('@tag:value1,value2,... => where tag in values', {
    data: `
      Task 1 @id:1 @project:foo @duration:1h
      Task 2 @id:2 @duration:25m
      Task 3 @id:3 @project:other
      Task 4 @id:4 @project:demo @duration:30m
    `,
    input: `
      filter: @project:foo,bar,other
      ---
    `,
    output: `
      filter: @project:foo,bar,other
      ---
      Task 1 @id:1 @project:foo @duration:1h
      Task 3 @id:3 @project:other
    `,
    stableOutput: true,
  })
  testCase('@tag!:value1,value2,... => where tag not in values', {
    data: `
      Task 1 @id:1 @project:foo @duration:1h
      Task 2 @id:2 @duration:25m
      Task 3 @id:3 @project:other
      Task 4 @id:4 @project:demo @duration:30m
    `,
    input: `
      filter: @project!:foo,bar,other
      ---
    `,
    output: `
      filter: @project!:foo,bar,other
      ---
      Task 2 @id:2 @duration:25m
      Task 4 @id:4 @project:demo @duration:30m
    `,
    stableOutput: true,
  })
  testCase('@tag:* => where tag has any value', {
    data: `
      Task 1 @id:1 @project:foo @duration:1h
      Task 2 @id:2 @duration:25m
      Task 3 @id:3 @project:other
      Task 4 @id:4 @project:demo @duration:30m
    `,
    input: `
      filter: @duration:*
      ---
    `,
    output: `
      filter: @duration:*
      ---
      Task 1 @id:1 @project:foo @duration:1h
      Task 2 @id:2 @duration:25m
      Task 4 @id:4 @project:demo @duration:30m
    `,
    stableOutput: true,
  })
  testCase('@tag!:* => where tag does not have any value', {
    data: `
      Task 1 @id:1 @project:foo @duration:1h
      Task 2 @id:2 @duration:25m
      Task 3 @id:3 @project:other
      Task 4 @id:4 @project:demo @duration:30m
    `,
    input: `
      filter: @duration!:*
      ---
    `,
    output: `
      filter: @duration!:*
      ---
      Task 3 @id:3 @project:other
    `,
    stableOutput: true,
  })
})

describe('acceptance > handle: apply', () => {
  afterEach(() => Bun.file(dbPath).delete())
  testCase('it applies a single tag to items on the input', {
    data: `
      Task 1 @id:1 @fun:true @duration:1h
      Task 2 @id:2 @serious:true @duration:25m
        Task 3 @id:3 @project:other
      Task 4 @id:4 @project:demo @duration:30m
    `,
    input: `
      apply: @project:foo
      ---
      Task 2 @id:2 @serious:true @duration:25m
        Task 3 @id:3 @parent:2 @project:other
      Task 4 @id:4 @project:demo @duration:30m
      Task 5 is new
      Task 6 is also new @project:new
    `,
    output: `
      apply: @project:foo
      ---
      Task 1 @id:1 @fun:true @duration:1h
      Task 2 @id:2 @serious:true @duration:25m @project:foo
        Task 3 @id:3 @parent:2 @project:foo
      Task 4 @id:4 @project:foo @duration:30m
      Task 5 is new @id:5 @project:foo
      Task 6 is also new @id:6 @project:foo
    `,
  })
  testCase('it applies multiple tags to items on the input', {
    data: `
      Task 1 @id:1 @fun:true @duration:1h
      Task 2 @id:2 @serious:true @duration:25m
      Task 3 @id:3 @project:other
      Task 4 @id:4 @project:demo @duration:30m
    `,
    input: `
      apply: @project:foo @duration:30m
      ---
      Task 2 @id:2 @serious:true @duration:25m
      Task 3 @id:3 @project:other
      Task 5 is new
      Task 6 is also new @project:new
    `,
    output: `
      apply: @project:foo @duration:30m
      ---
      Task 1 @id:1 @fun:true @duration:1h
      Task 2 @id:2 @serious:true @duration:30m @project:foo
      Task 3 @id:3 @project:foo @duration:30m
      Task 4 @id:4 @project:demo @duration:30m
      Task 5 is new @id:5 @project:foo @duration:30m
      Task 6 is also new @id:6 @project:foo @duration:30m
    `,
  })
})

describe('acceptance > handle: defaults', () => {
  afterEach(() => Bun.file(dbPath).delete())
  testCase('it adds default tags to items on the input', {
    data: `
      Task 1 @id:1 @fun:true @duration:1h
      Task 2 @id:2 @serious:true @duration:25m
      Task 3 @id:3 @project:other
      Task 4 @id:4 @project:demo @duration:30m
    `,
    input: `
      defaults: @project:foo @duration:30m
      ---
      Task 2 @id:2 @serious:true @duration:25m
        Task 3 @id:3 @project:other
      Task 5 is new
      Task 6 is also new @project:new
    `,
    output: `
      defaults: @project:foo @duration:30m
      ---
      Task 1 @id:1 @fun:true @duration:1h
      Task 2 @id:2 @serious:true @duration:25m @project:foo
        Task 3 @id:3 @parent:2 @project:other @duration:30m
      Task 4 @id:4 @project:demo @duration:30m
      Task 5 is new @id:5 @project:foo @duration:30m
      Task 6 is also new @id:6 @project:new @duration:30m
    `,
  })
})

describe('acceptance > handle: group-by', () => {
  afterEach(() => Bun.file(dbPath).delete())
  testCase('it groups items by a single tag', {
    data: `
      Task 1 @id:1 @project:foo @duration:1h
      Task 2 @id:2 @project:bar @duration:25m
      Task 3 @id:3 @project:foo
      Task 4 @id:4 @project:demo @duration:30m
      Task 5 @id:5 @temp:true
    `,
    input: `
      groupBy: @project:asc
      ---
    `,
    output: `
      groupBy: @project:asc
      ---
      bar:
        Task 2 @id:2 @project:bar @duration:25m
      demo:
        Task 4 @id:4 @project:demo @duration:30m
      foo:
        Task 1 @id:1 @project:foo @duration:1h
        Task 3 @id:3 @project:foo
      [undefined]:
        Task 5 @id:5 @temp:true
    `,
    stableOutput: true,
  })
  testCase('it sorts groups ASC', {
    data: `
      Task 1 @id:1 @project:foo @duration:1h
      Task 2 @id:2 @project:bar @duration:25m
      Task 3 @id:3 @project:foo
      Task 4 @id:4 @project:demo @duration:30m
      Task 5 @id:5 @temp
    `,
    input: `
      groupBy: @project:asc
      ---
    `,
    output: `
      groupBy: @project:asc
      ---
      bar:
        Task 2 @id:2 @project:bar @duration:25m
      demo:
        Task 4 @id:4 @project:demo @duration:30m
      foo:
        Task 1 @id:1 @project:foo @duration:1h
        Task 3 @id:3 @project:foo
      [undefined]:
        Task 5 @id:5 @temp:true
    `,
    stableOutput: true,
  })
  testCase('it sorts groups DESC', {
    data: `
      Task 1 @id:1 @project:foo @duration:1h
      Task 2 @id:2 @project:bar @duration:25m
      Task 3 @id:3 @project:foo
      Task 4 @id:4 @project:demo @duration:30m
      Task 5 @id:5 @temp
    `,
    input: `
      groupBy: @project:desc
      ---
    `,
    output: `
      groupBy: @project:desc
      ---
      foo:
        Task 1 @id:1 @project:foo @duration:1h
        Task 3 @id:3 @project:foo
      demo:
        Task 4 @id:4 @project:demo @duration:30m
      bar:
        Task 2 @id:2 @project:bar @duration:25m
      [undefined]:
        Task 5 @id:5 @temp:true
    `,
    stableOutput: true,
  })
  testCase('it groups items by multiple tags', {
    data: `
      Task 1 @id:1 @project:foo @duration:1h
      Task 2 @id:2 @project:bar @duration:25m
      Task 3 @id:3 @project:foo
      Task 4 @id:4 @duration:30m
      Task 5 @id:5 @temp
      Task 6 @id:6 @project:foo @duration:1h
      Task 7 @id:7 @project:foo @duration:25m
    `,
    input: `
      groupBy: @project:desc @duration:asc
      ---
    `,
    output: `
      groupBy: @project:desc @duration:asc
      ---
      foo:
        25m:
          Task 7 @id:7 @project:foo @duration:25m
        1h:
          Task 1 @id:1 @project:foo @duration:1h
          Task 6 @id:6 @project:foo @duration:1h
        [undefined]:
          Task 3 @id:3 @project:foo
      bar:
        25m:
          Task 2 @id:2 @project:bar @duration:25m
      [undefined]:
        30m:
          Task 4 @id:4 @duration:30m
        [undefined]:
          Task 5 @id:5 @temp:true
    `,
    stableOutput: true,
  })
  testCase('it sets the tag value for all subitems of a group', {
    data: `
      Task 1 @id:1 @project:foo @duration:1h
      Task 2 @id:2 @project:bar @duration:25m
      Subtask of Task 2 @id:6 @parent:2 @project:bar @duration:25m
      Task 3 @id:3 @project:foo
      Task 4 @id:4 @project:demo @duration:30m
      Task 5 @id:5 @temp
    `,
    input: `
      groupBy: @project:asc
      ---
      bar:
        Task 2 @id:2 @project:bar @duration:25m
          Subtask of Task 2 @id:6 @parent:2 @project:bar @duration:25m
        Task 4 @id:4 @project:demo @duration:30m
      demo:
      foo:
        Task 1 @id:1 @project:foo @duration:1h
        Task 5 @id:5 @temp
      [undefined]:
        Task 3 @id:3 @project:foo
    `,
    output: `
      groupBy: @project:asc
      ---
      bar:
        Task 2 @id:2 @project:bar @duration:25m
          Subtask of Task 2 @id:6 @parent:2 @project:bar @duration:25m
        Task 4 @id:4 @project:bar @duration:30m
      foo:
        Task 1 @id:1 @project:foo @duration:1h
        Task 5 @id:5 @temp:true @project:foo
      [undefined]:
        Task 3 @id:3
    `,
    stableOutput: true,
  })
})

function testCase(name: string, { data, input, output, stableOutput }: TestCase) {
  test(name, async () => {
    const handler = createHandler({ dbPath })
    const dbItems = await handler.db.createDbItems(parse(dedent(data)))
    await handler.db.save(dbItems)
    input = dedent(input)
    output = dedent(output)
    expect(stringify(await handler.handle(parse(input)))).toBe(output)
    if (stableOutput) {
      expect(stringify(await handler.handle(parse(output)))).toBe(output)
    }
  })
}
