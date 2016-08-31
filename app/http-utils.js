import xs from 'xstream'

const sanitizeJSONBody = res$ => {
  return res$.map((res) => {
    if (res) {
      try {
        return JSON.parse(res.text)
      } catch (e) {
        throw new Error('Malformed response (not JSON) \n' + e.message)
      }
    } else {
      throw new Error('Missing response body')
    }
  })
}

let failure = r$ => r$.drop().replaceError((error) => {
  const resp = error.response
  const { status, text } = resp || { text: error.message }
  return xs.of(new Error(`status: ${status}, message: ${text}`))
})
let success = r$ => r$.replaceError(xs.empty)

/**
 *
 * @param {string} scope
 * @param HTTP - the HTTP driver
 * @returns {{parseUrlResponse$: stream, parseUrlError$: stream}}
 */
function splitHttpScope (scope, HTTP) {
  const select$ = HTTP.select(scope).map(sanitizeJSONBody)
  const baseStreamSuccess$ = select$.map(success).flatten()
  const baseStreamFailure$ = select$.map(failure).flatten()
  return {
    parseUrlResponse$: baseStreamSuccess$.remember(),
    parseUrlError$: baseStreamFailure$.remember()
  }
}

export {
  splitHttpScope
}
