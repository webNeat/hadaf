import { Item, parse } from '@hadaf/syntax'
import * as operations from './operations/index.js'
import { createDatabase } from './createDatabase.js'
import { Handler, HandlerConfig, HandlerState } from './types.js'
import { reversed } from './functions.js'

export function createHandler(partialConfig: HandlerConfig): Handler {
  const config: Required<HandlerConfig> = {
    operations: {},
    itemsSeparator: '---',
    ...partialConfig,
  }
  const state: HandlerState = {
    database: createDatabase(config.dbPath),
    separator: config.itemsSeparator,
    operations: { ...operations, ...config.operations },
  }
  return {
    db: state.database,
    handle: (items) => handle(state, items),
    autocomplete: (text) => autocomplete(state, text),
  }
}

async function handle(state: HandlerState, items: Item[]) {
  const separatorIndex = items.findIndex((x) => x.text === state.separator)
  let operationsItems: Item[]
  let contentItems: Item[]
  if (separatorIndex === -1) {
    operationsItems = []
    contentItems = items
  } else {
    operationsItems = items.slice(0, separatorIndex)
    contentItems = items.slice(separatorIndex + 1)
  }
  let operations = operationsItems.filter((x) => state.operations[x.title]).map((x) => state.operations[x.title](state.database, x))

  for (const operation of operations) {
    contentItems = await operation.items.inputItems(contentItems)
  }
  let dbItems = await state.database.createDbItems(contentItems)
  for (const operation of operations) {
    dbItems = await operation.items.inputDbItems(dbItems)
  }
  await state.database.save(dbItems)

  dbItems = await state.database.fetch()
  operations = reversed(operations)
  for (const operation of operations) {
    dbItems = await operation.items.outputDbItems(dbItems)
  }
  contentItems = state.database.toItems(dbItems)
  for (const operation of operations) {
    contentItems = await operation.items.outputItems(contentItems)
  }

  if (operationsItems.length > 0) {
    return [...operationsItems, items[separatorIndex], ...contentItems]
  }
  return contentItems
}

async function autocomplete(state: HandlerState, text: string) {
  text = text.trimStart()
  if (text === '') {
    return Object.keys(state.operations).map((x) => x + ': ')
  }
  let index = text.lastIndexOf(' ')
  const lastWord = text.slice(index === -1 ? 0 : index + 1)
  const [item] = parse(text)
  const getOperation = state.operations[item.title]
  if (getOperation !== undefined) {
    const operation = getOperation(state.database, item)
    if (lastWord === '' || (lastWord[0] === '@' && !lastWord.includes(':'))) {
      let names = await operation.tags.names()
      if (lastWord === '') names = names.map((x) => '@' + x)
      return names
    }
    if (lastWord[0] === '@' && lastWord.includes(':')) {
      const name = lastWord.slice(1, lastWord.indexOf(':'))
      return operation.tags.values(name)
    }
    return []
  }
  if (lastWord === '' || (lastWord[0] === '@' && !lastWord.includes(':'))) {
    let names = await state.database.tagNames()
    if (lastWord === '') names = names.map((x) => '@' + x)
    return names
  }
  if (lastWord[0] === '@' && lastWord.includes(':')) {
    const name = lastWord.slice(1, lastWord.indexOf(':'))
    return state.database.tagValues(name)
  }
  return []
}
