import notFalsy from 'lodash/identity'
import xs from 'xstream'

function model (sources) {
  const { url$, depth$ } = sources
  return xs.combine(url$.filter(notFalsy), depth$).map(([url, depth]) => ({ url, depth }))
}

/**
 * @param sources
 * @param sources.url$ {stream} A stream of url-formatted string
 * @param sources.depth$ {stream} A stream of integers
 * @returns {{HTTP: {stream}}}
 */
function Parse (sources) {
  const state$ = model(sources)
  const request$ = state$.map(({ url, depth }) => ({
    url: '/api/parse',
    method: 'POST',
    type: 'application/json',
    progress: false,
    category: 'parse',
    send: {
      url,
      depth
    }
  }))
  return {
    HTTP: request$
  }
}

export default Parse
