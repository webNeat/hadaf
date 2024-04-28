import type { Item, TagData } from '@hadaf/syntax'

export type StorageConfig<T> = {
  dbPath: string
  initialData: T
}

export type Storage<T> = {
  read: () => Promise<T>
  write: (data: T) => Promise<void>
}

export type DatabaseConfig = {
  dbPath: string
}

export type Database = {
  createDbItems: (items: Item[]) => Promise<DbItem[]>
  toItems: (dbItems: DbItem[]) => Item[]
  fetch: () => Promise<DbItem[]>
  save: (dbItems: DbItem[]) => Promise<void>
  tagNames: () => Promise<string[]>
  tagValues: (name: string) => Promise<string[]>
}

export type Data = {
  meta: {
    /**
     * Database version, usefull for migrations
     */
    version: number
    /**
     * next item id
     */
    nextId: number
  }

  /**
   * {
   *   tag1: {
   *     value1: [...ids of items with tag1=value1],
   *     value2: [...ids of items with tag1=value2],
   *   },
   *    ...
   * }
   */
  indexes: Record<string, Record<string, number[]>>

  /**
   * Items by id
   */
  items: Record<number, DbItem>
}

export type DbItem = {
  id: number
  parentId?: number
  title: string
  text: string
  tagsNames: string[]
  tagsData: Record<string, TagData>
}

export type HandlerConfig = {
  dbPath: string
  itemsSeparator?: string
  operations?: Record<string, OperationFactory>
}

export type HandlerState = {
  database: Database
  operations: Record<string, OperationFactory>
  separator: string
}

export type Handler = {
  db: Database
  handle: (items: Item[]) => Promise<Item[]>
  autocomplete: (text: string) => Promise<string[]>
}

export type OperationFactory = (db: Database, item: Item) => Operation

export type Operation = {
  tags: {
    names: () => Promise<string[]>
    values: (name: string) => Promise<string[]>
  }
  items: {
    inputItems: (items: Item[]) => Promise<Item[]>
    inputDbItems: (items: DbItem[]) => Promise<DbItem[]>
    outputDbItems: (items: DbItem[]) => Promise<DbItem[]>
    outputItems: (items: Item[]) => Promise<Item[]>
  }
}
