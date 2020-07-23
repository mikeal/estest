import toulon from '../../toulon/index.js'

export default display => async argv => {
  let { concurrency } = argv
  if (argv.break) concurrency = 1
  const browser = await toulon()
  return async filename => {
    const tab = browser.tab()
    console.log({ tab, concurrency })
  }
}
