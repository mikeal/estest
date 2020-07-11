import { pathToFileURL } from 'url'

const runner = async api => {
  let { filename, onStart, onEnd, pipe } = api
  if (!pipe) pipe = x => x
  const pending = []
  class TestNode {
    constructor ({ name, fn, filename, parent }) {
      this.name = name
      this.fn = fn
      this.filename = filename
      this.parent = parent
      pending.push(this)
    }

    add (name, fn) {
      return pipe(new TestNode({ ...this, name, parent: this }))
    }
  }
  if (!filename) throw new Error('No filename')
  const url = pathToFileURL(filename)
  const module = await import(url)
  if (!module.default) module.default = module.test
  if (module.default) {
    await module.default((name, fn) => pipe(new TestNode({ name, fn, filename })))
  } else {
    if (module.tests) {
      for (const [name, fn] of Object.entries(module.tests)) {
        pipe(new TestNode({ name, fn, filename }))
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
  }
  while (pending.length) {
    await Promise.all(pending.splice(0, concurrency).map(_run))
  }
}

export default runner
