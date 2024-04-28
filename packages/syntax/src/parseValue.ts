import { env } from './env.js'
import { TagData } from './types.js'
import * as tokens from './tokens.js'

export function parseValue(text: string): TagData {
  let value: any
  if (((value = boolean(text)), value !== undefined)) return { type: 'boolean', value }
  if ((value = number(text))) return { type: 'number', value }
  if ((value = duration(text))) return { type: 'duration', value }
  if ((value = date(text))) return { type: 'date', value }
  if ((value = list(text))) return { type: 'list', value }
  if ((value = interval(text))) return { type: 'interval', value }
  return { type: 'text', value: text }
}

function boolean(text: string) {
  if (text === 'true') return true
  if (text === 'false') return false
}

function number(text: string) {
  const x = Number(text)
  if (text && !isNaN(x)) return x
}

function duration(text: string) {
  let match: any
  if ((match = text.match(/^(?<hours>\d+)h$/))) {
    // 5h
    return 60 * Number(match.groups.hours)
  }
  if ((match = text.match(/^(?<minutes>\d+)m$/))) {
    // 15m
    return Number(match.groups.minutes)
  }
  if ((match = text.match(/^(?<hours>\d+)h(?<minutes>\d+)m$/))) {
    // 15m
    return 60 * Number(match.groups.hours) + Number(match.groups.minutes)
  }
}

/**
 * <date>, <time>, <date>_<time>
 * date:
 *   <day>: 14, tomorrow, mon, ..., sun
 *   <day>/<month>: 14/03
 *   <day>/<month>/<year>: 14/03/2024
 * time:
 *   <hour>h<minutes>: 11h45
 *
 * defaults:
 *   year, month, day: current
 *   time: 00h00
 */
function date(text: string) {
  let match: any
  if ((match = text.match(/^(?<day>\d{2})\/(?<month>\d{2})\/(?<year>\d{4})(_(?<hour>\d{2})h(?<minute>\d{2}))?$/))) {
    // 15/05/2024_10h45 | 15/05/2024
    const { year, month, day, hour = '00', minute = '00' } = match.groups
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)).getTime()
  }
  if ((match = text.match(/^(?<hour>\d{2})h(?<minute>\d{2})$/))) {
    // 10h45
    const res = new Date(env.getTime())
    res.setHours(Number(match.groups.hour), Number(match.groups.minute), 0, 0)
    return res.getTime()
  }
}

function list(text: string) {
  if (text.includes(tokens.list_separator)) return text.split(tokens.list_separator).map(parseValue)
}

function interval(text: string) {
  const parts = text.split(tokens.interval_separator)
  if (parts.length === 2) return parts.map(parseValue)
}
