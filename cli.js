#!/usr/bin/env node
import yargs from 'yargs'
import runner from './src/runner.js'
import display from './src/display.js'

const options = yargs => {
  yargs.positional('files', {
    desc: 'Test files you want to run'
  })
}

const concurrency = 100

const run = async argv => {
  const { files } = argv
  if (!files) throw new Error('No test files')
  const run = await display(argv)
  let i = 0
  const pending = new Set()
  const ring = p => {
    pending.add(p)
    return p.then(value => pending.delete(p))
  }
  const runFile = filename => ring(runner(run(filename)))
  files.splice(0, concurrency).map(runFile)
  while (files.length) {
    await Promise.race([...pending])
    runFile(files.shift())
  }
}

const argv = yargs.command('$0 [files..]', 'Run test files', options, run).argv
