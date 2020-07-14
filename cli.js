#!/usr/bin/env node
import yargs from 'yargs'
import runner from './src/runner.js'
import serialDisplay from './src/display/serial.js'
import defaultDisplay from './src/display/index.js'

const options = yargs => {
  yargs.positional('files', {
    desc: 'Test files you want to run'
  })
  yargs.option('break', {
    desc: 'Run test serially until the first break and then stop',
    alias: 'b'
  })
}

const concurrency = 100

const run = async argv => {
  const { files } = argv
  if (!files) throw new Error('No test files')
  let display = defaultDisplay
  if (argv.b) {
    display = serialDisplay
  }
  const run = await display(argv)
  let i = 0
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
    const opts = await run(filename)
    await ring(runner(opts))
    if (opts.errors) {
      opts.errors.forEach(e => errors.push(e))
    }
  }
  await Promise.race(files.splice(0, concurrency).map(runFile))
  while (files.length) {
    await Promise.race([...pending])
    await runFile(files.shift())
  }
  await Promise.all([...pending])
  if (display.cleanup) await display.cleanup()
  if (errors.length) {
    console.error(errors.join('\n'))
    process.exit(1)
  }
}

const argv = yargs.command('$0 [files..]', 'Run test files', options, run).argv
