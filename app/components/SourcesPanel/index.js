import { div, pre, span } from '@cycle/dom'
import xs from 'xstream'

function intent (sources) {

}

function model (sources) {
  const { parseUrlResponse, parseUrlLoading, openPanel } = sources
  return xs.combine(
    parseUrlResponse.startWith(null),
    parseUrlLoading,
    openPanel
  ).map(([articleRep, isLoading, isPanelOpen]) => ({ articleRep, isLoading, isPanelOpen }))
}

function view (state$) {
  return state$.map(({ articleRep, isLoading, isPanelOpen }) => {
    const canShowContent = !isLoading && articleRep
    return div('#SourcesPanel', {
      attrs: {
        class: `${canShowContent ? (isPanelOpen ? 'is-expanded' : 'is-small') : 'is-collapsed'}`
      }
    }, [
      div('#SourcesPanel_header', { attrs: { class: 'flex-inline-centered' } }, [
        span('.title', 'Sources Panel')
      ]),
      pre('#SourcesView', JSON.stringify(articleRep, null, 2))
    ])
  })
}

function SourcesPanel (sources) {
  const { parseUrlResponse, parseUrlLoading, parseUrlError, openPanel } = sources
  const state$ = model(sources)
  // const articleRepVdom$ = xs.combine(
  //   parseUrlResponse.startWith(null),
  //   parseUrlLoading,
  //   openPanel
  // ).map(view)
  // merge errors mapped to null so that the previous diagram does not display upon error
  // const vdom$ = xs.merge(articleRepVdom$, parseUrlError.map((e) => null)).startWith(null)
  const vdom$ = view(state$)
  return {
    DOM: vdom$
  }
}

export default SourcesPanel
