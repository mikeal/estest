import run from './src/cli.js'

const files = [...Deno.args]
await run({files, debug: true, stdout: Deno.stdout, cwd: Deno.cwd() })
