import { div } from '@cycle/dom'
import isolate from '@cycle/isolate'
import xs from 'xstream'
// TODO: use canShowDiagram$ to expand / collapse

function view ({ articleRep, canShow }) {
  const { metaInfo } = articleRep || {}
  const { title } = metaInfo || {}
  return div('#TitleBar', { attrs: { class: metaInfo && canShow ? 'is-expanded' : 'is-collapsed' } }, [
    div('.title', [
      title || '?[Title not found]'
    ])
  ])
}

function model (sources) {
  const { parseUrlResponse$, canShowDiagram$ } = sources
  return xs.combine(
    parseUrlResponse$.filter((ans) => ans && ans.parseSuccess).startWith(null),
    canShowDiagram$
  ).map(([articleRep, canShow]) => ({ articleRep, canShow }))
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
