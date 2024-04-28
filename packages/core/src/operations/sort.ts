import { Item, Tag } from '@hadaf/syntax'
import { sortItemsByTags } from './_common.js'
import { Database, DbItem, Operation } from '../types.js'

const directions = ['asc', 'desc']

export function sort(db: Database, item: Item): Operation {
  const tags = item.tags.filter((x) => directions.includes(x.value as string))

  return {
    tags: {
      names: () => tagsNames(db, tags),
      values: async () => directions,
    },
    items: {
      inputItems: async (items) => items,
      inputDbItems: (dbItems) => beforeSave(tags, dbItems),
      outputDbItems: (dbItems) => afterFetch(tags, dbItems),
      outputItems: async (items) => items,
    },
  }
}

async function tagsNames(db: Database, tags: Tag[]): Promise<string[]> {
  const names = new Set(await db.tagNames())
  for (const { name } of tags) names.delete(name)
  return Array.from(names)
}

async function afterFetch(tags: Tag[], dbItems: DbItem[]): Promise<DbItem[]> {
  return sortItemsByTags(dbItems, tags)
}

async function beforeSave(tags: Tag[], items: DbItem[]): Promise<DbItem[]> {
  return items
}
