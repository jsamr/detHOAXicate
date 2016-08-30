import { div } from '@cycle/dom'

// TODO: use canShowDiagram$ to expand / collapse

function view (ans) {
  const { metaInfo } = ans || {}
  const { title } = metaInfo || {}
  return div('#TitleBar', { attrs: { class: metaInfo ? 'is-expanded' : 'is-collapsed' } }, [
    div('.title', [
      title || '?[Title not found]'
    ])
  ])
}

function model (sources) {
  const { parseUrlResponse$ } = sources
  const metaInfoStream$ = parseUrlResponse$.filter((ans) => ans && ans.parseSuccess).startWith(null)
  return metaInfoStream$
}

/**
 * @param sources
 * @param sources.parseUrlResponse$ - a stream of objects with api/parse response
 * @param sources.canShowDiagram$ - a stream of boolean
 * @returns {{DOM: stream}}
 * @constructor
 */
function TitleBar (sources) {
  const state$ = model(sources)
  const vdom$ = state$.map(view)
  return {
    DOM: vdom$
  }
}

export default TitleBar
