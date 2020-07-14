#!/usr/bin/env node
import yargs from 'yargs'
import run from './src/cli.js'

const options = yargs => {
  yargs.positional('files', {
    desc: 'Test files you want to run'
  })
  yargs.option('break', {
    desc: 'Run test serially until the first break and then stop',
    alias: 'b'
  })
}

const _run = argv => run({ ...argv, stdout: process.stdout, cwd: process.cwd() })

/* eslint-disable-next-line */
const argv = yargs.command('$0 [files..]', 'Run test files', options, _run).argv
