import xs from 'xstream'

const makeDebugListener = (streamName) => ({
  next: (value) => {
    console.info(streamName, 'RECEIVED VALUE', value)
    return value
  },
  error: (error) => console.error(streamName, 'ENCOUNTERED ERROR', error),
  complete: () => console.info(streamName, 'COMPLETED')
})

/**
 * Implementation of the RxJS pausable operator
 * Marble diagram :
 * CS |f-t--f--t--t--f-|
 * TS |-1-1-2-2-4-2-1-4|
 * OS |---1-----4-2-1--|
 * With CS the controlStream$, TS the targetStream$ and OS the outputStream$.
 * @param {stream} controlStream$ - the stream that will control the target stream
 * @returns {function(stream): stream} - A function to compose with
 */
function pausable (controlStream$) {
  return (stream$) => xs.combine(
    stream$,
    controlStream$
  ).filter(([streamVal, controlVal]) => controlVal)
    .map(([streamVal]) => streamVal)
}

/**
 * An operator to be applied to a xstream which maps the complementary value.
 * Ex : true -> false
 * @param {stream} stream$
 * @returns {stream}
 */
function complement (stream$) {
  return stream$.map((val) => !val)
}

function toErrorStream (stream) {
  return stream.replaceError((err) => xs.of(err))
}

export {
  pausable,
  complement,
  makeDebugListener,
  toErrorStream
}
