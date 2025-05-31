import { Item, Tag, parseValue, stringifyValue } from '@hadaf/syntax'
import { Database, Operation } from '../types.js'
import { SortDirection, sortDirections } from './_common.js'

const missingValue = '[undefined]'

type Groups = Record<string, Item[]> | NestedGroups
interface NestedGroups {
  [key: string]: Groups
}

export function groupBy(db: Database, item: Item): Operation {
  return {
    tags: {
      names: () => tagsNames(db, item.tags),
      values: async () => [...sortDirections],
    },
    items: {
      inputItems: async (items) => beforeSave(item.tags, items),
      inputDbItems: async (dbItems) => dbItems,
      outputDbItems: async (dbItems) => dbItems,
      outputItems: async (items) => afterFetch(item.tags, items),
    },
  }
}

async function tagsNames(db: Database, tags: Tag[]): Promise<string[]> {
  const names = new Set(await db.tagNames())
  for (const { name } of tags) names.delete(name)
  return Array.from(names)
}

async function afterFetch(tags: Tag[], items: Item[]): Promise<Item[]> {
  const names = tags.map((tag) => tag.name)
  const directions = tags.map((tag) => tag.value) as SortDirection[]
  const groups = createGroups(items, names)
  return getGoupedItems(groups, directions)
}

async function beforeSave(tags: Tag[], items: Item[]): Promise<Item[]> {
  return flattenGroupedItems(items, tags)
}

function createGroups(items: Item[], names: string[]): Groups {
  const groups = {} as Record<string, Item[]>
  for (const item of items) {
    const tag = item.tags.find((tag) => tag.name === names[0])
    let value = tag ? stringifyValue(tag) : missingValue
    if (value === '') value = 'true'
    groups[value] ||= []
    groups[value].push(item)
  }
  if (names.length === 1) return groups
  const nestedGroups = {} as NestedGroups
  for (const value in groups) {
    nestedGroups[value] = createGroups(groups[value], names.slice(1))
  }
  return nestedGroups
}

function getGoupedItems(groups: Groups, directions: Array<SortDirection>): Item[] {
  const items = [] as Item[]
  for (const title in groups) {
    const group = groups[title]
    items.push({ title, text: '', description: '', tags: [], items: Array.isArray(group) ? group : getGoupedItems(group, directions.slice(1)) })
  }
  items.sort((a, b) => {
    if (a.title === missingValue) return 1
    if (b.title === missingValue) return -1
    const aValue = parseValue(a.title).value
    const bValue = parseValue(b.title).value
    return (directions[0] === 'desc' ? -1 : 1) * (aValue < bValue ? -1 : aValue > bValue ? 1 : 0)
  })
  return items
}

function flattenGroupedItems(groups: Item[], tags: Tag[], values: Record<string, string> = {}): Item[] {
  if (tags.length < 1) {
    const additionalTags = [] as Tag[]
    for (const [name, value] of Object.entries(values)) {
      additionalTags.push({ name, ...parseValue(value) })
    }
    return addTags(groups, additionalTags)
  }
  const { name } = tags[0]
  return groups.flatMap((group) => flattenGroupedItems(group.items || [], tags.slice(1), { ...values, [name]: group.title }))
}

function addTags(items: Item[], tags: Tag[]): Item[] {
  for (const item of items) {
    for (const tag of tags) {
      if (tag.value === missingValue) item.tags = item.tags.filter((t) => t.name !== tag.name)
      else item.tags.push(tag)
    }
    item.items = addTags(item.items, tags)
  }
  return items
}
