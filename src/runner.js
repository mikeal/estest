import { pathToFileURL } from 'url'

const runner = async api => {
  let { filename, onStart, onEnd, pipe } = api
  if (!pipe) pipe = x => x
  const pending = []
  const create = ({ name, fn, filename, parent }) => {
    const test = (name, fn) => create({name, fn, filename, parent: test})
    test.testName = name
    test.fn = fn
    test.filename = filename
    test.parent = parent
    if (parent) {
      pending.splice(pending.indexOf(parent), 0, test)
    } else {
      pending.push(test)
    }
    return pipe(test)
  }
  if (!filename) throw new Error('No filename')
  const url = pathToFileURL(filename)
  const module = { ... await import(url) }
  if (!module.default) module.default = module.test
  if (module.default) {
    await module.default((name, fn) => create({ name, fn, filename }))
  } else {
    if (module.tests) {
      for (const [name, fn] of Object.entries(module.tests)) {
        create({ name, fn, filename })
      }
    } else {
      throw new Error('This module does not export anything regonizable as a test')
    }
  }

  let { concurrency } = module
  if (concurrency === true) concurrency = api.concurrency || 100
  else concurrency = 1

  if (pending.length === 0) throw new Error('No tests!')
  const _run = async node => {
    await onStart(node)
    let threw = true
    try {
      await node.fn(node)
      threw = false
    } catch (e) {
      await node.onFail(e)
    }
    if (!threw) await node.onPass()
    await onEnd(node)
    pending.splice(pending.indexOf(node), 1)
  }
  while (pending.length) {
    const chunk = pending.slice(0, concurrency)
    await Promise.all(chunk.map(_run))
    concurrency = 1
  }
}

export default runner
