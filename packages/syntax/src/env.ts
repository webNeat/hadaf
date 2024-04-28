export type Env = {
  getTime: () => number
}

const defaultEnv: Env = {
  getTime: () => Date.now(),
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
}
