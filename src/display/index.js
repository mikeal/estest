import style from './style.js'

const join = (...args) => args.join('')
const red = (...args) => join(style.fg.Red, ...args, style.Reset)
const green = (...args) => join(style.fg.Green, ...args, style.Reset)
const white = (...args) => join(style.fg.White, ...args, style.Reset)
const magenta = (...args) => join(style.fg.Magenta, ...args, style.Reset)

let { rows, columns } = process.stdout
process.stdout.on('resize', () => {
  rows = process.stdout.rows
  columns = process.stdout.columns
})

const lines = {}

const display = argv => async filename => {
  const write = async line => {
    if (!process.stdout.isTTY || argv.debug) {
      const status = [
        `started: ${white(line.started)}`,
        `passed: ${green(line.passed)}`,
        `failed: ${red(line.failed)}`
      ]
      console.log(`${line.prefix}(${status.join(', ')})`)
    } else {
      const c = { started: 0, passed: 0, failed: 0 }
      const started = Object.values(lines).forEach(l => {
        c.started += l.started
        c.passed += l.passed
        c.failed += l.failed
      })
      const status = [
        `started: ${white(c.started)}`,
        `passed: ${green(c.passed)}`,
        `failed: ${red(c.failed)}`
      ]
      process.stdout.cursorTo(0)
      const prefix = white('estest') + magenta(': ')
      await new Promise(resolve => {
        process.stdout.write(`${prefix}(${status.join(', ')})`, resolve)
      })
    }
  }
  const line = {
    prefix: white(filename + ': '),
    i: Object.keys(lines).length,
    running: 0,
    passed: 0,
    failed: 0,
    started: 0
  }
  const errors = []
  const onStart = async node => {
    line.running += 1
    line.started += 1
    const { testName } = node
    node.onPass = async () => {
      line.passed += 1
      await write(line)
    }
    node.onFail = async e => {
      line.failed += 1
      errors.push(red(`${filename} ${testName} failed:`))
      errors.push(white(e.stack))
      await write(line)
    }
    await write(line)
  }
  const onEnd = node => {
    line.running -= 1
  }
  await write(line)
  lines[filename] = line
  return { filename, onStart, onEnd, errors }
}
display.cleanup = () => process.stdout.write('\n')

export default display
