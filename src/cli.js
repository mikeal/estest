import runner from './runner.js'
import serialDisplay from './display/serial.js'
import defaultDisplay from './display/index.js'
import browser from './browser.js'

const concurrency = 100

export default async argv => {
  const { files, stdout, cwd } = argv
  if (!files) throw new Error('No test files')
  let display = defaultDisplay
  if (argv.break) {
    display = serialDisplay
  }
  if (argv.browser) {
    display = await browser(display)
  }
  const run = await display(argv)
  const pending = new Set()
  const ring = p => {
    pending.add(p)
    return p.then(value => {
      pending.delete(p)
      return value
    })
  }
  const errors = []
  const runFile = async filename => {
    if (!argv.browser) {
      const opts = await run(filename)
      await ring(runner({ ...opts, stdout, cwd }))
      if (opts.errors) {
        opts.errors.forEach(e => errors.push(e))
      }
    } else {
      await ring(run(filename, errors))
    }
  }
  await Promise.race(files.splice(0, concurrency).map(runFile))
  while (files.length) {
    await Promise.race([...pending])
    await runFile(files.shift())
  }
  await Promise.all([...pending])
  if (run.cleanup) await run.cleanup()
  if (display.cleanup) await display.cleanup(argv)
  if (errors.length) {
    console.error(errors.join('\n'))
    process.exit(1)
  }
}
