import { Position } from './types.js'

export class Reader {
  #text: string
  #position: Position

  constructor(text: string) {
    this.#text = text
    this.#position = { line: 1, col: 1, character: 0 }
  }

  text() {
    return this.#text
  }

  position() {
    return { ...this.#position }
  }

  remaining() {
    return this.#text.slice(this.#position.character)
  }

  read(count = 1) {
    const startIndex = this.#position.character
    while (count > 0) {
      if (this.#readChar() === undefined) break
      count--
    }
    return this.#text.slice(startIndex, this.#position.character)
  }

  peek(count = 1) {
    return this.#text.slice(this.#position.character, this.#position.character + count)
  }

  readOne(...words: string[]) {
    const maxLength = words.reduce((length, w) => Math.max(length, w.length), 0)
    const text = this.#text.slice(this.#position.character, this.#position.character + maxLength)
    for (const w of words) {
      if (text.startsWith(w)) {
        for (let _ = 0; _ < w.length; _++) this.#readChar()
        return w
      }
    }
  }

  peekOne(...words: string[]) {
    const maxLength = words.reduce((length, w) => Math.max(length, w.length), 0)
    const text = this.#text.slice(this.#position.character, this.#position.character + maxLength)
    for (const w of words) {
      if (text.startsWith(w)) return w
    }
  }

  readMany(...words: string[]) {
    const maxLength = words.reduce((length, w) => Math.max(length, w.length), 0)
    let result = ''
    while (!this.isEnd()) {
      let found = false
      const text = this.#text.slice(this.#position.character, this.#position.character + maxLength)
      for (const w of words) {
        if (text.startsWith(w)) {
          for (let _ = 0; _ < w.length; _++) this.#readChar()
          result += w
          found = true
          break
        }
      }
      if (!found) break
    }
    return result
  }

  peekMany(...words: string[]) {
    const maxLength = words.reduce((length, w) => Math.max(length, w.length), 0)
    let result = ''
    let position = this.#position.character
    while (position < this.#text.length) {
      let found = false
      const text = this.#text.slice(position, position + maxLength)
      for (const w of words) {
        if (text.startsWith(w)) {
          result += w
          position += w.length
          found = true
          break
        }
      }
      if (!found) break
    }
    return result
  }

  readUntil(...words: string[]) {
    let startIndex = this.#position.character
    const maxLength = words.reduce((length, w) => Math.max(length, w.length), 0)
    while (this.peek()) {
      let shouldStop = false
      const text = this.#text.slice(this.#position.character, this.#position.character + maxLength)
      for (const w of words) {
        if (text.startsWith(w)) {
          shouldStop = true
          break
        }
      }
      if (shouldStop) break
      this.#readChar()
    }
    return this.#text.slice(startIndex, this.#position.character)
  }

  peekUntil(...words: string[]) {
    let index = this.#position.character
    const maxLength = words.reduce((length, w) => Math.max(length, w.length), 0)
    while (index < this.#text.length) {
      let shouldStop = false
      const text = this.#text.slice(index, index + maxLength)
      for (const w of words) {
        if (text.startsWith(w)) {
          shouldStop = true
          break
        }
      }
      if (shouldStop) break
      index++
    }
    return this.#text.slice(this.#position.character, index)
  }

  isEnd() {
    return this.#text.length <= this.#position.character
  }

  #readChar() {
    const c = this.#text[this.#position.character]
    if (c === undefined) return c
    if (c === `\n`) {
      this.#position.line++
      this.#position.col = 1
    } else {
      this.#position.col++
    }
    this.#position.character++
    return c
  }
}
