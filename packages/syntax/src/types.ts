export type Document = Item[]

export type Item = {
  title: string
  text: string
  tags: Tag[]
  items: Item[]
}

export type Tag = TagData & { name: string }

export type TagData =
  | { type: 'text'; value: string }
  | { type: 'boolean'; value: boolean }
  | { type: 'number'; value: number }
  | { type: 'duration'; value: number }
  | { type: 'date'; value: number }
  | { type: 'list'; value: TagData[] }
  | { type: 'interval'; value: [TagData, TagData] }

export type TokenData = {
  text: string
  start: Position
  end: Position
}

export type Position = {
  line: number
  col: number
  character: number
}
