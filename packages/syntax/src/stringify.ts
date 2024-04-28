import * as tokens from './tokens.js'
import { stringifyValue } from './stringifyValue.js'
import { Document, Item, Tag } from './types.js'

export function stringify(doc: Document): string {
  return doc.map((item) => stringifyItem(item)).join(`\n`)
}

function stringifyItem(item: Item, indentention = '') {
  const parts: string[] = []
  if (item.title) parts.push(item.title + tokens.title_end)
  if (item.text) parts.push(item.text)
  if (item.tags) parts.push(...item.tags.map(stringifyTag))
  const lines = [indentention + parts.join(' ')]
  lines.push(...item.items.map((x) => stringifyItem(x, indentention + '  ')))
  return lines.join(`\n`)
}

function stringifyTag(tag: Tag): string {
  const value = stringifyValue(tag)
  let result = tokens.tag_start + tag.name
  if (value) result += tokens.tag_separator + value
  return result
}
