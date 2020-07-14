const style = {
 Reset: "\x1b[0m",
 Bright: "\x1b[1m",
 Dim: "\x1b[2m",
 Underscore: "\x1b[4m",
 Blink: "\x1b[5m",
 Reverse: "\x1b[7m",
 Hidden: "\x1b[8m",
 fg: {
  Black: "\x1b[30m",
  Red: "\x1b[31m",
  Green: "\x1b[32m",
  Yellow: "\x1b[33m",
  Blue: "\x1b[34m",
  Magenta: "\x1b[35m",
  Cyan: "\x1b[36m",
  White: "\x1b[37m",
  Crimson: "\x1b[38m" //القرمزي
 },
 bg: {
  Black: "\x1b[40m",
  Red: "\x1b[41m",
  Green: "\x1b[42m",
  Yellow: "\x1b[43m",
  Blue: "\x1b[44m",
  Magenta: "\x1b[45m",
  Cyan: "\x1b[46m",
  White: "\x1b[47m",
  Crimson: "\x1b[48m"
 }
}

const red = (...args) => console.log(style.fg.Red, ...args, style.Reset)
const green = (...args) => console.log(style.fg.Green, ...args, style.Reset)
const white = (...args) => console.log(style.fg.White, ...args, style.Reset)

const indent = node => {
  let i = '-'
  while (node.parent) {
    node = node.parent
    i += '-'
  }
  return i
}

export default argv => filename => {
  const onStart = node => {
    const { testName } = node
    let i = indent(node)
    node.onPass = () => {
      green(i, testName, 'passed')
    }
    node.onFail = e => {
      red(i, testName, 'failed')
    }
    white(i, testName, 'started')
  }
  const onEnd = node => {
    // console.log(indent(node), node.testName, 'ended')
  }
  return { filename, onStart, onEnd, concurrency: 1 }
}
