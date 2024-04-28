import { Tag } from '@hadaf/syntax'
import { DbItem } from '../types.js'

export const sortDirections = ['asc', 'desc'] as const
export type SortDirection = (typeof sortDirections)[number]

export function sortItemsByTags(dbItems: DbItem[], tags: Tag[]): DbItem[] {
  dbItems.sort((a, b) => {
    for (const { name, value } of tags) {
      let [high, low] = value === 'asc' ? [1, -1] : [-1, 1]
      const aValue = a.tagsData[name]?.value
      const bValue = b.tagsData[name]?.value
      if (aValue === undefined) return 1
      if (bValue === undefined) return -1
      if (aValue < bValue) return low
      if (aValue > bValue) return high
    }
    return 0
  })
  return dbItems
}
