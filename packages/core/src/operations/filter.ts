import { Item, Tag, TagData } from '@hadaf/syntax'
import { Database, DbItem, Operation } from '../types.js'
import { groupByUniqueKey } from '../functions.js'

type Filter = (data?: TagData) => boolean

// @tag:value => where tag equals value
// @tag!:value => where tag does not equal value
// @tag:a..b => where tag between a and b
// @tag!:a..b => where tag is not between a and b
// @tag:value1,value2,... => where tag in values
// @tag!:value1,value2,... => where tag not in values
// @tag:* => where tag has any value
// @tag!:* => where tag does not have any value
export function filter(db: Database, item: Item): Operation {
  const predicate = createPredicate(item.tags)
  return {
    tags: {
      names: () => tagsNames(db, item),
      values: (name) => tagValues(db, name),
    },
    items: {
      inputItems: async (items) => items,
      inputDbItems: async (dbItems) => dbItems,
      outputDbItems: async (dbItems) => dbItems.filter(predicate),
      outputItems: async (items) => items,
    },
  }
}

async function tagsNames(db: Database, { tags }: Item): Promise<string[]> {
  const names = await db.tagNames()
  const existing = new Set(tags.map((x) => x.name))
  return names.filter((x) => !existing.has(x)).flatMap((name) => [name, name + '!'])
}

async function tagValues(db: Database, name: string): Promise<string[]> {
  if (name.endsWith('!')) name = name.slice(0, -1)
  const values = await db.tagValues(name)
  return values
}

function createPredicate(tags: Tag[]) {
  const filters = {} as Record<string, Filter>
  for (let { name, type, value } of tags) {
    if (name.endsWith('!')) {
      name = name.slice(0, -1)
      const fn = createFilter({ type, value } as TagData)
      filters[name] = (x) => !fn(x)
    } else {
      filters[name] = createFilter({ type, value } as TagData)
    }
  }
  return (item: DbItem) => {
    for (const name in filters) {
      const fn = filters[name]
      if (!fn(item.tagsData[name])) return false
    }
    return true
  }
}

function createFilter({ type, value }: TagData): Filter {
  if (type === 'list') {
    const filters = value.map((x) => createFilter(x))
    return (data) => filters.some((fn) => fn(data))
  }
  if (type === 'interval') {
    const [a, b] = value
    return (x) => !!x && a.value <= x.value && x.value <= b.value
  }
  if (value === '*') return (x) => !!x
  return (x) => !!x && x.type === type && x.value === value
}
