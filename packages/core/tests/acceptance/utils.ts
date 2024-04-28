export function unindent(text: string) {
  const lines = text.split('\n')
  let minIndent = Infinity
  for (const line of lines) {
    if (line.trim() === '') continue
    const indent = line.match(/^\s*/)![0].length
    minIndent = Math.min(minIndent, indent)
  }
  return lines.map((line) => line.slice(minIndent)).join('\n')
}
