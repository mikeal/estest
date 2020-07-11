import runner from '../src/runner.js'
import { deepStrictEqual } from 'assert'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const same = deepStrictEqual

const fixture = join(__dirname, 'fixture')

export default t => {
  console.log('asdf')
  t('basic runner', async test => {
    console.log('yup')
    let xStart = false
    let xFail = false
    let xPass = false
    let onEnd
    const done = new Promise(resolve => {
      onEnd = async node => resolve(node)
    })
    const onStart = async node => {
      xStart = true
      node.onPass = () => xPass = true
      node.onFail = () => xFail = true
    }
    await runner({ filename: join(fixture, 'noop.js'), onStart, onEnd })
    await done
    same(xStart, true)
    same(xFail, true)
    same(xPass, true)
    console.log('blah')
  })
}

