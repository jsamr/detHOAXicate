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
 * Marble diagram (t = true, f = false):
 * CS |f-t--f--t--t--f-|
 * TS |-1-1-2-2-4-2-1-4|
 * OS |---1-----4-2-1--|
 * With CS the controlStream$, TS the targetStream$ and OS the outputStream$.
 * @param {stream} controlStream$ - the stream that will control the target stream
 * @returns {function(stream): stream} - A function to compose with
 */
function pausable (controlStream$) {
  return (targetStream$) => xs.combine(
    targetStream$,
    controlStream$
  ).filter(([streamVal, controlVal]) => controlVal)
    .map(([streamVal]) => streamVal)
}

/**
 * An operator to be applied to a xstream which maps the complementary value.
 * Marble diagram (t = true, f = false) :
 * TS |f-t--f--t--t--f-|
 * OS |t-f--t--f--f--t-|
 * With TS the targetStream$ and OS the outputStream$.
 * @param {stream} targetStream$
 * @returns {stream} - the OS
 */
function complement (targetStream$) {
  return targetStream$.map((val) => !val)
}

/**
 * Ouputs a stream which values are alternatively true and false
 * Marble diagram (t = true, f = false) with initial = false :
 * TS |--1--2--3--4--5-|
 * OS |f-t--f--t--f--t-|
 * With TS the targetStream$ and OS the outputStream$.
 * @param {boolean} initial - the initial value of the OS
 * @returns {function(stream): stream} - A function to compose with
 */
function toggle (initial = false) {
  return (stream$) => stream$.fold((acc) => !acc, initial)
}

function toErrorStream (stream) {
  return stream.replaceError((err) => xs.of(err))
}

function accumulate (initial, min = -Infinity, max = +Infinity) {
  return (targetStream$) => targetStream$.fold((acc, mod) => {
    const neu = acc + mod
    if (neu > max || neu < min) return acc
    else return neu
  }, initial)
}

export {
  pausable,
  toggle,
  accumulate,
  complement,
  makeDebugListener,
  toErrorStream
}
