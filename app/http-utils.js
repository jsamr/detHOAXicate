import xs from 'xstream'
import identity from 'lodash/identity'
import APP_ERROR_CODES from 'shared/application-error-codes'

const ERROR_TYPES_HANDLERS = {
  http: (options) => `status: ${options.status}, ${options.message}`,
  application: (options) => APP_ERROR_CODES[options.errorCode],
  json: (options) => options.message
}

function standardizedError (type, options) {
  console.info('TYPE', type, 'OPTIONS', options)
  const error = new Error(`type: ${type}, message: ${ERROR_TYPES_HANDLERS[type](options)}`)
  error.type = type
  error.options = options
  return error
}

const sanitizeJSONBody = res$ => {
  return res$.map((res) => {
    if (res) {
      try {
        return JSON.parse(res.text)
      } catch (e) {
        throw standardizedError('json', { message: 'Malformed response (not JSON), ' + e.message })
      }
    } else {
      throw standardizedError('json', { message: 'Missing response body' })
    }
  })
}

function standardizedHttpError (error) {
  const resp = error.response || {}
  const { status, text } = resp
  throw standardizedError('http', { status, message: text || 'server internal error' })
}

function handleHttpErrors (res$) {
  return res$.replaceError(standardizedHttpError)
}

function handleApplicationErrors (checker) {
  return (res$) => res$.map((res) => {
    const options = checker(res)
    if (options) throw standardizedError('application', options)
    else return res
  })
}

let failure = r$ => r$.drop().replaceError(xs.of)
let success = r$ => r$.replaceError(xs.empty)

/**
 *
 * @param {string} scope
 * @param {object} HTTP - the HTTP driver
 * @param {function(resp:object):object?} customFailure, a function that returns
 * <ul>
 *   <li> null if resp has no error description </li>
 *   <li> an object with custom fields sent to the application error handler otherwise </li>
 * </ul>
 * @returns {{parseUrlResponse$: stream, parseUrlError$: stream}}
 */
function splitHttpScope (scope, HTTP, customFailure = identity) {
  const select$ = HTTP.select(scope).map(handleHttpErrors).map(sanitizeJSONBody).map(handleApplicationErrors(customFailure))
  const baseStreamSuccess$ = select$.map(success).flatten()
  const baseStreamFailure$ = select$.map(failure).flatten().debug('ERROR')
  return {
    parseUrlResponse$: baseStreamSuccess$.remember(),
    parseUrlError$: baseStreamFailure$.remember()
  }
}

export {
  splitHttpScope
}
