const same = (x, y) => {
  if (x !== y) throw new Error(`${x} does not equal ${y}`)
}

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
