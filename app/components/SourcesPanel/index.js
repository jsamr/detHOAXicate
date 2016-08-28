import { div, span } from '@cycle/dom'
import xs from 'xstream'
import SourcesView from './SourcesView'
import Header from './Header'

function model (sources) {
  const { DOM, parseUrlResponse$, parseUrlLoading$, isPanelOpen$ } = sources
  const articleRep$ = parseUrlResponse$.startWith(null)
  const sourcesView = SourcesView({ DOM, articleRep$ })
  const header = Header()
  return xs.combine(
    articleRep$,
    parseUrlLoading$,
    isPanelOpen$,
    sourcesView.DOM,
    header.DOM
  ).map(([articleRep, isLoading, isPanelOpen, sourcesViewDom, headerDom]) => ({ articleRep, isLoading, isPanelOpen, sourcesViewDom, headerDom }))
}

function view ({ articleRep, isLoading, isPanelOpen, sourcesViewDom, headerDom }) {
  const canShowContent = !isLoading && articleRep
  return div('#SourcesPanel', {
    attrs: {
      class: `${canShowContent ? (isPanelOpen ? 'is-expanded' : 'is-small') : 'is-collapsed'}`
    }
  }, [
    headerDom,
    div('#SourcesView_container', [
      sourcesViewDom
    ])
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
