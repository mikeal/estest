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

/* eslint ignore next */
const argv = yargs.command('$0 [files..]', 'Run test files', options, run).argv
