import { Reader } from './Reader.js'
import * as tokens from './tokens.js'
import { parseValue } from './parseValue.js'
import { Document, Item, Tag, TagData } from './types.js'

export function parse(text: string): Document {
  const reader = new Reader(text)
  const items: Document = []
  const levels = [{ indentation: 0, items }]
  while (!reader.isEnd()) {
    const indentation = reader.readMany(...tokens.spaces).length
    const description = parseDescription(reader)
    const item = parseItem(reader)
    if (item || description) {
      if (indentation > last(levels).indentation) {
        const lastItem = last(last(levels).items)
        levels.push({ indentation, items: lastItem.items })
        reader.readOne(...tokens.new_line)
      }
      while (indentation < last(levels).indentation) levels.pop()
      if (item) last(levels).items.push(item)
      if (description) {
        const lastItem = last(last(levels).items)
        if (lastItem.description) {
          lastItem.description += '\n' + description
        } else {
          lastItem.description = description
        }
      }
    }
    reader.readOne(...tokens.new_line)
  }
  return items
}

function parseItem(reader: Reader): Item | null {
  const title = parseTitle(reader)
  const text = parseText(reader)
  const tags = parseTags(reader)
  const items: Item[] = []
  const description = ''
  if (title === '' && text === '' && tags.length === 0) return null
  return { title, text, tags, items, description }
}

function parseDescription(reader: Reader) {
  if (!reader.peekOne(tokens.description_prefix)) return ''
  reader.read(tokens.description_prefix.length)
  return reader.readUntil(...tokens.new_line)
}

function parseTitle(reader: Reader) {
  const prefix = reader.peekUntil(...tokens.spaces, ...tokens.new_line)
  if (prefix.startsWith(tokens.tag_start) || !prefix.endsWith(tokens.title_end)) return ''
  reader.read(prefix.length)
  return prefix.slice(0, -tokens.title_end.length)
}

function parseText(reader: Reader) {
  reader.readMany(...tokens.spaces)
  if (reader.peekOne(tokens.tag_start)) return ''
  const text = reader.readUntil(...tokens.new_line, ...tokens.spaced_tag_start)
  reader.readMany(...tokens.spaces)
  return text.trim()
}

function parseTags(reader: Reader) {
  const tags: Tag[] = []
  while (!reader.isEnd()) {
    const tag = parseTag(reader)
    if (!tag) break
    tags.push(tag)
    reader.readMany(...tokens.spaces)
  }
  return tags
}

function parseTag(reader: Reader): Tag | null {
  if (!reader.peekOne(tokens.tag_start)) return null
  reader.read(tokens.tag_start.length)
  const name = reader.readUntil(...tokens.whitespace, tokens.tag_separator)
  let data: TagData = { type: 'boolean', value: true }
  if (reader.peekOne(tokens.tag_separator)) {
    reader.read(tokens.tag_separator.length)
    data = parseValue(reader.readUntil(...tokens.whitespace))
  }
  return { name, ...data }
}

function last<T>(list: T[]): T {
  return list[list.length - 1]
}
