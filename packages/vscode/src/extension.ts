import * as path from 'path'
import { writeFile, mkdir } from 'fs/promises'
import * as vscode from 'vscode'
import { createHandler } from '@hadaf/core'
import { parse, stringify } from '@hadaf/syntax'

export async function activate(context: vscode.ExtensionContext) {
  const homeDir = process.env.HOME || process.env.USERPROFILE
  if (!homeDir) throw new Error(`Could not find home directory, tried HOME and USERPROFILE`)
  const hadafDir = process.env.HADAF_DIR || path.join(homeDir, '.hadaf')
  await mkdir(hadafDir, { recursive: true })

  const handler = createHandler({
    dbPath: path.join(hadafDir, 'db.json'),
  })
  vscode.workspace.onDidSaveTextDocument(async (document) => {
    const filePath = document.uri.fsPath
    const ext = path.extname(filePath)
    if (ext !== '.hadaf') return
    const fileContent = document.getText()
    const newContent = stringify(await handler.handle(parse(fileContent)))
    await writeFile(filePath, newContent)
  })
  vscode.languages.registerCompletionItemProvider(
    'hadaf',
    {
      async provideCompletionItems(document, position) {
        const text = document.getText(new vscode.Range(new vscode.Position(position.line, 0), position))
        const suggestions = await handler.autocomplete(text)
        return suggestions.map((x) => new vscode.CompletionItem(x))
      },
    },
    ':',
    '@'
  )
}

export function deactivate() {}
