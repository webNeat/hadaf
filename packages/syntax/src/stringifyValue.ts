import { TagData } from './types.js'
import * as tokens from './tokens.js'

export function stringifyValue(x: TagData): string {
  if (x.type === 'boolean') return boolean(x.value)
  if (x.type === 'number') return number(x.value)
  if (x.type === 'duration') return duration(x.value)
  if (x.type === 'date') return date(x.value)
  if (x.type === 'list') return list(x.value)
  if (x.type === 'interval') return interval(x.value)
  return x.value
}

function boolean(value: boolean) {
  return value ? '' : 'false'
}

function number(value: number) {
  return String(value)
}

function duration(value: number) {
  const hours = Math.floor(value / 60)
  const minutes = value % 60
  if (hours == 0) return `${minutes}m`
  if (minutes == 0) return `${hours}h`
  return `${hours}h${minutes}m`
}

function date(value: number) {
  const date = new Date(value)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const hasTime = hour != '00' || minute != '00'
  return hasTime ? `${day}/${month}/${year}_${hour}h${minute}` : `${day}/${month}/${year}`
}

function list(value: TagData[]) {
  return value.map(stringifyValue).join(tokens.list_separator)
}

function interval(value: [TagData, TagData]) {
  return value.map(stringifyValue).join(tokens.interval_separator)
}
