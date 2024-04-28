export const new_line = [`\n`, `\r\n`]
export const spaces = [' ', `\t`]
export const whitespace = [...new_line, ...spaces]
export const tag_start = '@'
export const spaced_tag_start = spaces.map((s) => s + tag_start)
export const tag_separator = ':'
export const title_end = ':'
export const list_separator = ','
export const interval_separator = '..'
