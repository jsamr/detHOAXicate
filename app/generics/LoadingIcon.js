import isolate from '@cycle/isolate'
import { div, i } from '@cycle/dom'

function view ({ isLoading }) {
  return div('.LoadingIcon.flex-inline-centered', { style: { opacity: isLoading ? 1 : 0 } }, [ i('.icon-spin6 .icon-spin') ])
}

function model (sources) {
  return sources.isLoading$.map((isLoading) => ({ isLoading }))
}

function LoadingIcon (sources) {
  const state$ = model(sources)
  const vnode$ = state$.map(view)
  return {
    DOM: vnode$
  }
}

/**
 * @param sources
 * @param sources.isLoading$ - a stream of boolean
 * @returns {{DOM: stream}}
 */
export default (sources) => isolate(LoadingIcon)(sources)
