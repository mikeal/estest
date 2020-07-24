import toulon from '../../toulon/index.js'
import puppeteer from 'puppeteer'
import { promises as fs } from 'fs'

const runner = fs.readFile(new URL('runner.js', import.meta.url))

const html = `<html><head><script type="module">
  const run = async () => {
    const runner = await import('/_dagdb/runner.js')
    const _onStart = async node => {
      node.onPass = onPass
      node.onFail = onFail
      await onStart({...node})
    }
    const api = { filename, onStart: _onStart, onEnd, pipe, cwd, browser, concurrency }
    await runner.default(api)
    finish()
  }
  run().catch(e => { throw e })
</script>
</head>
</html>
`

export default display => async argv => {
  display = await display(argv)
  let { concurrency } = argv
  if (argv.break) concurrency = 1
  const handler = async (opts, req, res) => {
    if (req.url === '/_dagdb/runner.js') {
      res.setHeader('content-type', 'text/javascript')
      res.end(await runner)
      return
    }
    if (req.url.startsWith('/_cwd/')) {
      const f = await fs.readFile(req.url.replace('/_cwd', argv.cwd))
      res.setHeader('content-type', 'text/javascript')
      res.end(f)
    }
  }
  const browser = await toulon(puppeteer, {handler})
  const run = async (filename, errors) => {
    let finish
    let onError
    const until = new Promise((resolve, reject) => {
      finish = resolve
      onError = e => {
        reject(e)
      }
      // TODO: wire up reject to any fail major fail states
    })
    const stubs = { pipe: x => x, concurrency: null }
    const opts = await display(filename)
    const api = { ...stubs, ...opts, finish, browser: true, stdout: null }
    const onConsole = async msg => {
      const args = await Promise.all(msg.args().map(h => h.jsonValue().then(s => {
        if (typeof s === 'string') {
          try { return JSON.parse(s) }
          catch { }
        }
        return s
      })))
      const type = msg.type()
      if (type === 'error') return console.error(...args)
      console.log(...args)
    }
    const tab = await browser.tab(html, onError, onConsole, api)
    await until
    if (opts.errors) opts.errors.forEach(e => errors.push(e))
  }
  run.cleanup = () => browser.close()
  return run
}
