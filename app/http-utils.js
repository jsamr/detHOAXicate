import xs from 'xstream'

let failure = r$ => r$.drop().replaceError(xs.of)
let success = r$ => r$.replaceError(xs.empty)

function splitHttpScope (scope, HTTP) {
  const baseStreamSuccess$ = HTTP.select(scope).map(success).flatten()
  const baseStreamFailure$ = HTTP.select(scope).map(failure).flatten()
  return {
    parseUrlResponse$: baseStreamSuccess$.map(res => res ? JSON.parse(res.text) : null),
    parseUrlError$: baseStreamFailure$
  }
}

export {
  splitHttpScope
}
