import style from './style.js'

const join = (...args) => args.join('')
const red = (...args) => join(style.fg.Red, ...args, style.Reset)
const green = (...args) => join(style.fg.Green, ...args, style.Reset)
const white = (...args) => join(style.fg.White, ...args, style.Reset)
const magenta = (...args) => join(style.fg.Magenta, ...args, style.Reset)

const lines = {}

const display = argv => async filename => {
  const { stdout, cwd } = argv
  const write = async line => {
    if (argv.debug || !stdout.isTTY) {
      const status = [
        `started: ${white(line.started)}`,
        `passed: ${green(line.passed)}`,
        `failed: ${red(line.failed)}`
      ]
      console.log(`${line.prefix}(${status.join(', ')})`)
    } else {
      display.cleanup = () => console.log('')
      const c = { started: 0, passed: 0, failed: 0 }
      Object.values(lines).forEach(l => {
        c.started += l.started
        c.passed += l.passed
        c.failed += l.failed
      })
      const status = [
        `started: ${white(c.started)}`,
        `passed: ${green(c.passed)}`,
        `failed: ${red(c.failed)}`
      ]
      stdout.cursorTo(0)
      const prefix = white('estest') + magenta(': ')
      await new Promise(resolve => {
        stdout.write(`${prefix}(${status.join(', ')})`, resolve)
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
  const onPass = testName => async () => {
    line.passed += 1
    await write(line)
  }
  const onFail = testName => async e => {
    line.failed += 1
    errors.push(red(`${filename} ${testName} failed:`))
    errors.push(white(e.stack))
    await write(line)
  }
  const onStart = async node => {
    line.running += 1
    line.started += 1
    const { testName } = node
    node.onPass = onPass(testName)
    node.onFail = onFail(testName)
    await write(line)
  }
  const onEnd = node => {
    line.running -= 1
  }
  await write(line)
  lines[filename] = line
  return { filename, onStart, onEnd, onFail, onPass, errors, cwd, stdout }
}

export default display
