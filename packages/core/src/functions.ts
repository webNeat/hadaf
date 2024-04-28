export function groupByKey<T extends Record<string, any>, K extends keyof T>(items: T[], key: K): Record<T[K], T[]> {
  const index = {} as Record<T[K], T[]>
  for (const item of items) {
    const value = item[key]
    index[value] ||= []
    index[value].push(item)
  }
  return index
}

export function groupByUniqueKey<T extends Record<string, any>, K extends keyof T>(items: T[], key: K): Record<T[K], T> {
  const index = {} as Record<T[K], T>
  for (const item of items) {
    index[item[key]] = item
  }
  return index
}

export function reversed<T>(items: T[]): T[] {
  return [...items].reverse()
}
