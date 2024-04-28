import { env } from './env.js'
import { Storage, StorageConfig } from './types.js'

export function createStorage<T>(config: StorageConfig<T>): Storage<T> {
  return {
    read: () => read(config),
    write: (data) => write(config, data),
  }
}

export async function read<T>(config: StorageConfig<T>): Promise<T> {
  if (await env.fileExists(config.dbPath)) {
    const content = await env.readFile(config.dbPath)
    return JSON.parse(content) as T
  }
  return structuredClone(config.initialData)
}

export async function write<T>(config: StorageConfig<T>, data: T): Promise<void> {
  return env.writeFile(config.dbPath, JSON.stringify(data))
}
