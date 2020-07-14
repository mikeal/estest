import runner from '../src/runner.js'
import { deepStrictEqual } from 'assert'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const same = deepStrictEqual

const fixture = join(__dirname, 'fixture')

export default async test => {
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

  const times = []
  test('test 1', async test => {
    times.push(Date.now())
    await sleep(10)
    same(times.length, 2)
  })
  test('test 2', async test => {
    times.push(Date.now())
    await sleep(10)
    same(times.length, 2)
  })
}
