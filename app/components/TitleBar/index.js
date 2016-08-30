import { div } from '@cycle/dom'
import isolate from '@cycle/isolate'

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

function TitleBar (sources) {
  const state$ = model(sources)
  const vdom$ = state$.map(view)
  return {
    DOM: vdom$
  }
}

/**
 * A component displaying the title of the selected article.
 * @param sources
 * @param sources.parseUrlResponse$ - a stream of objects with api/parse response
 * @param sources.canShowDiagram$ - a stream of boolean
 * @returns {{DOM: stream}}
 */
export default (sources) => isolate(TitleBar)(sources)
