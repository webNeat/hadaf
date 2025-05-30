import * as os from 'os'
import * as fs from 'fs/promises'

export type Env = {
  getTime: () => number
  getEnvVars: () => Record<string, string | undefined>
  getHomeDir: () => string
  mkdir: (path: string) => Promise<void>
  fileExists: (filename: string) => Promise<boolean>
  readFile: (filename: string) => Promise<string>
  writeFile: (filename: string, content: string) => Promise<void>
  readStdin: () => Promise<string>
  writeStdout: (text: string) => void
  writeStderr: (text: string) => void
}

const defaultEnv: Env = {
  getTime: () => Date.now(),
  getEnvVars: () => process.env,
  getHomeDir: () => os.homedir(),
  mkdir: async (path) => {
    await fs.mkdir(path, { recursive: true })
  },
  fileExists: (filename) =>
    fs
      .access(filename)
      .then(() => true)
      .catch(() => false),
  readFile: (filename) => fs.readFile(filename, 'utf8'),
  writeFile: (filename, content) => fs.writeFile(filename, content, 'utf8'),
  readStdin: () => {
    return new Promise((resolve) => {
      let content = ''
      process.stdin.on('data', (data) => {
        content += data.toString()
      })
      process.stdin.on('end', () => {
        resolve(content)
      })
    })
  },
  writeStdout: (text) => process.stdout.write(text),
  writeStderr: (text) => process.stderr.write(text),
}

let customEnv: Partial<Env> = {}

export function setEnv(overrides: Partial<Env>) {
  Object.assign(customEnv, overrides)
}

export function resetEnv() {
  customEnv = {}
}

export const env: Env = {
  getTime: () => customEnv.getTime?.() ?? defaultEnv.getTime(),
  getEnvVars: () => customEnv.getEnvVars?.() ?? defaultEnv.getEnvVars(),
  getHomeDir: () => customEnv.getHomeDir?.() ?? defaultEnv.getHomeDir(),
  mkdir: (path) => customEnv.mkdir?.(path) ?? defaultEnv.mkdir(path),
  fileExists: (filename) => customEnv.fileExists?.(filename) ?? defaultEnv.fileExists(filename),
  readFile: (filename) => customEnv.readFile?.(filename) ?? defaultEnv.readFile(filename),
  writeFile: (filename, content) => customEnv.writeFile?.(filename, content) ?? defaultEnv.writeFile(filename, content),
  readStdin: () => customEnv.readStdin?.() ?? defaultEnv.readStdin(),
  writeStdout: (text) => customEnv.writeStdout?.(text) ?? defaultEnv.writeStdout(text),
  writeStderr: (text) => customEnv.writeStderr?.(text) ?? defaultEnv.writeStderr(text),
}
