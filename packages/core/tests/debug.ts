import { configure, processCLIArgs, run } from '@japa/runner'
import { expect } from '@japa/expect'
import { expectTypeOf } from '@japa/expect-type'

processCLIArgs(process.argv.splice(2))
configure({
  files: ['build/**/*.test.js'],
  plugins: [expect(), expectTypeOf()],
})

run()
