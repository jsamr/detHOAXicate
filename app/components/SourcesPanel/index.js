import { div, span } from '@cycle/dom'
import xs from 'xstream'
import SourcesView from './SourcesView'

function model (sources) {
  const { DOM, parseUrlResponse$, parseUrlLoading$, isPanelOpen$ } = sources
  const articleRep$ = parseUrlResponse$.startWith(null)
  const sourcesView = SourcesView({ DOM, articleRep$ })
  return xs.combine(
    articleRep$,
    parseUrlLoading$,
    isPanelOpen$,
    sourcesView.DOM
  ).map(([articleRep, isLoading, isPanelOpen, sourcesViewDom]) => ({ articleRep, isLoading, isPanelOpen, sourcesViewDom }))
}

function view ({ articleRep, isLoading, isPanelOpen, sourcesViewDom }) {
  const canShowContent = !isLoading && articleRep
  return div('#SourcesPanel', {
    attrs: {
      class: `${canShowContent ? (isPanelOpen ? 'is-expanded' : 'is-small') : 'is-collapsed'}`
    }
  }, [
    div('#SourcesPanel_header', { attrs: { class: 'flex-inline-centered' } }, [
      span('.title', 'Sources Panel')
    ]),
    sourcesViewDom
  ])
}

function SourcesPanel (sources) {
  const state$ = model(sources)
  const vdom$ = state$.map(view)
  return {
    DOM: vdom$
  }
}

export default SourcesPanel
