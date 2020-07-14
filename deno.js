/* globals Deno */
import run from './src/cli.js'

const files = [...Deno.args]
run({ files, debug: true, stdout: Deno.stdout, cwd: Deno.cwd() })
