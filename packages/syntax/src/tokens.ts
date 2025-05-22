export const new_line = [`\n`, `\r\n`] as const
export const spaces = [' ', `\t`] as const
export const whitespace = [...new_line, ...spaces] as const
export const tag_start = '@'
export const spaced_tag_start = spaces.map((s) => s + tag_start)
export const tag_separator = ':'
export const title_end = ':'
export const list_separator = ','
export const interval_separator = '..'
export const description_prefix = '| '
