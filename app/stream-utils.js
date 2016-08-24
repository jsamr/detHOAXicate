import xs from 'xstream'

function toErrorStream (stream) {
  return stream.replaceError((err) => xs.of(err))
}

export {
  toErrorStream
}
