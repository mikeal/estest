export default argv => filename => {
  const onStart = node => {
    console.log('onStart', node)
    node.onPass = () => console.log('pass')
    node.onFail = e => console.log('fail', e)
  }
  const onEnd = node => {
    console.log('ended')
  }
  return { filename, onStart, onEnd }
}
