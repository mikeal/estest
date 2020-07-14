import runner from '../src/runner.js'
import { deepStrictEqual } from 'assert'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const same = deepStrictEqual

const fixture = join(__dirname, 'fixture')

const testRunner = async test => {
  test('basic runner', async test => {
    let xStart = false
    let xFail = false
    let xPass = false
    let onEnd
    const done = new Promise(resolve => {
      onEnd = async node => resolve(node)
    })
    const onStart = async node => {
      xStart = true
      node.onPass = () => { xPass = true }
      node.onFail = () => { xFail = true }
    }
    await runner({ filename: join(fixture, 'noop.js'), onStart, onEnd })
    await done
    same(xStart, true)
    same(xFail, false)
    same(xPass, true)
  })

  test('testName', test => {
    same(test.testName, 'testName')
  })
  test('nested', test => {
    same(test.testName, 'nested')
    let nestedComplete = false
    test('one', test => {
      same(test.testName, 'one')
      same(test.parent.testName, 'nested')
      test('one-two', test => {
        same(test.testName, 'one-two')
        same(test.parent.testName, 'one')
        same(test.parent.parent.testName, 'nested')
        nestedComplete = true
      })
    })
    test('oneCompleted', test => {
      same(nestedComplete, true)
    })
  })
}

const concurrency = 1
export { testRunner as test, concurrency }
