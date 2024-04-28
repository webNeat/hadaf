import { Item, Tag, TagData } from '@hadaf/syntax'
import { Database, DbItem, Operation } from '../types.js'

export function apply(db: Database, item: Item): Operation {
  return {
    tags: {
      names: () => tagNames(db, item),
      values: (name) => db.tagValues(name),
    },
    items: {
      inputItems: async (items) => items,
      inputDbItems: async (dbItems) => beforeSave(item.tags, dbItems),
      outputDbItems: async (dbItems) => dbItems,
      outputItems: async (items) => items,
    },
  }
}

async function beforeSave(tags: Tag[], dbItems: DbItem[]): Promise<DbItem[]> {
  for (const item of dbItems) {
    for (const { name, type, value } of tags) {
      if (!item.tagsData[name]) item.tagsNames.push(name)
      item.tagsData[name] = { type, value } as TagData
    }
  }
  return dbItems
}

async function tagNames(db: Database, { tags }: Item) {
  const names = await db.tagNames()
  const existing = new Set(tags.map((x) => x.name))
  return names.filter((x) => !existing.has(x))
}
