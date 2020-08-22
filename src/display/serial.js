import style from './style.js'

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
    const i = indent(node)
    node.onPass = () => {
      green(i, testName, 'passed')
    }
    node.onFail = e => {
      red(`${filename} ${testName} failed:`)
      white(e.stack)
      red(i, testName, 'failed')
    }
    white(i, testName, 'started')
  }
  const onEnd = node => {
    // console.log(indent(node), node.testName, 'ended')
  }
  return { filename, onStart, onEnd, concurrency: 1 }
}
