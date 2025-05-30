import { Item, Tag, TagData, stringifyValue } from '@hadaf/syntax'
import { createStorage } from './createStorage.js'
import { Data, Database, DbItem, Storage } from './types.js'

export function createDatabase(dbPath: string): Database {
  const initialData: Data = {
    meta: { version: 1, nextId: 1 },
    indexes: {},
    items: {},
  }

  const storage = createStorage({ dbPath, initialData })
  return {
    createDbItems: (items) => createDbItems(storage, items),
    toItems: (dbItems) => toItems(dbItems),
    fetch: () => fetch(storage),
    save: (items) => save(storage, items),
    tagNames: () => tagNames(storage),
    tagValues: (name) => tagValues(storage, name),
  }
}

async function createDbItems(storage: Storage<Data>, items: Item[]) {
  const db = await storage.read()
  const dbItems = [] as DbItem[]
  for (const item of items) {
    dbItems.push(...toDbItems(db, item))
  }
  return dbItems
}

function toItems(dbItems: DbItem[]) {
  const items = {} as Record<number, Item>
  const childrenIds = {} as Record<number, number[]>
  const rootIds = new Set<number>()
  for (const dbItem of dbItems) {
    rootIds.add(dbItem.id)
    if (dbItem.parentId) {
      childrenIds[dbItem.parentId] ||= []
      childrenIds[dbItem.parentId].push(dbItem.id)
    }
    items[dbItem.id] = toItem(dbItem)
  }
  for (const parentId in childrenIds) {
    if (!items[parentId]) delete childrenIds[parentId]
  }
  for (const parentId in childrenIds) {
    for (const childId of childrenIds[parentId]) rootIds.delete(childId)
  }
  return groupItems(items, childrenIds, Array.from(rootIds))
}

async function fetch(storage: Storage<Data>): Promise<DbItem[]> {
  const db = await storage.read()
  const dbItems = Object.values(db.items)
  dbItems.sort((a, b) => a.id - b.id)
  return dbItems
}

async function save(storage: Storage<Data>, dbItems: DbItem[]): Promise<void> {
  const db = await storage.read()
  for (const item of dbItems) {
    if (item.tagsData.delete) deleteItem(db, item)
    else updateItem(db, item)
  }
  await storage.write(db)
}

async function tagNames(storage: Storage<Data>): Promise<string[]> {
  const db = await storage.read()
  return Object.keys(db.indexes)
}

async function tagValues(storage: Storage<Data>, name: string): Promise<string[]> {
  const db = await storage.read()
  return Object.keys(db.indexes[name] || {})
}

function updateItem(db: Data, item: DbItem) {
  if (db.items[item.id]) deleteIndexes(db, db.items[item.id])
  db.items[item.id] = item
  db.meta.nextId = Math.max(db.meta.nextId, item.id + 1)
  addIndexes(db, item)
}

function deleteItem(db: Data, item: DbItem) {
  const children = Object.values(db.items).filter((child) => child.parentId === item.id)
  for (const child of children) deleteItem(db, child)
  deleteIndexes(db, item)
  delete db.items[item.id]
}

function addIndexes(db: Data, item: DbItem) {
  for (const name in item.tagsData) {
    const value = stringifyValue(item.tagsData[name])
    if (!value) continue
    db.indexes[name] ||= {}
    db.indexes[name][value] ||= []
    if (!db.indexes[name][value].includes(item.id)) {
      db.indexes[name][value].push(item.id)
    }
  }
}

function deleteIndexes(db: Data, item: DbItem) {
  for (const name in item.tagsData) {
    const value = stringifyValue(item.tagsData[name])
    db.indexes[name] ||= {}
    db.indexes[name][value] ||= []
    db.indexes[name][value] = db.indexes[name][value].filter((id) => id !== item.id)
    if (db.indexes[name][value].length === 0) delete db.indexes[name][value]
    if (Object.keys(db.indexes[name]).length === 0) delete db.indexes[name]
  }
}

function toItem(item: DbItem): Item {
  const title = item.title
  const text = item.text
  const items: Item[] = []
  const tags: Tag[] = []
  for (const name of item.tagsNames) {
    tags.push({ name, ...item.tagsData[name] })
  }
  return { title, text, description: '', tags, items }
}

function toDbItems(db: Data, item: Item, parentId = 0): DbItem[] {
  let id = 0
  const title = item.title
  const text = item.text
  const tagsNames = [] as string[]
  const tagsData = {} as Record<string, TagData>
  tagsData.title = { type: 'text', value: item.title }
  for (const tag of item.tags) {
    if (tag.name === 'parent') continue
    if (tag.name === 'id') {
      id = tag.value as number
      continue
    }
    if (!tagsNames.includes(tag.name)) tagsNames.push(tag.name)
    tagsData[tag.name] = { type: tag.type, value: tag.value } as TagData
  }
  if (parentId) {
    tagsNames.unshift('parent')
    tagsData.parent = { type: 'number', value: parentId }
  }
  id = id || db.meta.nextId++
  tagsNames.unshift('id')
  tagsData.id = { type: 'number', value: id }

  db.meta.nextId = Math.max(db.meta.nextId, id + 1)
  const dbItems: DbItem[] = [{ id, parentId, title, text, tagsNames, tagsData }]
  for (const child of item.items) {
    dbItems.push(...toDbItems(db, child, id))
  }
  return dbItems
}

function groupItems(items: Record<number, Item>, childrenIds: Record<number, number[]>, rootIds: number[]) {
  const groupedItems = [] as Item[]
  for (const rootId of rootIds) {
    const item = items[rootId]
    if (childrenIds[rootId]) {
      item.items = groupItems(items, childrenIds, childrenIds[rootId])
    }
    groupedItems.push(item)
  }
  return groupedItems
}
