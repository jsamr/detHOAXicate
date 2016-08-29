import { div, span } from '@cycle/dom'
import xs from 'xstream'
import SourcesView from './SourcesView'
import Header from './Header'

function transform (sources) {
  const { DOM, parseUrlResponse$, ...otherSources } = sources
  const articleRep$ = parseUrlResponse$.startWith(null)
  const sourcesView = SourcesView({ DOM, articleRep$ })
  const header = Header(sources)
  const isPanelOpen$ = header.isPanelOpen$.startWith(false)
  return {
    ...otherSources,
    sourcesViewVdom$: sourcesView.DOM,
    headerVdom$: header.DOM,
    isPanelOpen$,
    articleRep$
  }
}

function model (sources) {
  const { parseUrlLoading$, articleRep$, sourcesViewVdom$, headerVdom$, isPanelOpen$ } = sources
  return xs.combine(
    articleRep$,
    parseUrlLoading$,
    isPanelOpen$,
    sourcesViewVdom$,
    headerVdom$
  ).map(([articleRep, isLoading, isPanelOpen, sourcesViewDom, headerDom]) => ({ articleRep, isLoading, isPanelOpen, sourcesViewDom, headerDom }))
}

function view ({ articleRep, isLoading, isPanelOpen, sourcesViewDom, headerDom }) {
  console.info(arguments)
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
  const transformedSources = transform(sources)
  const state$ = model(transformedSources)
  const vdom$ = state$.map(view)
  return {
    DOM: vdom$,
    isPanelOpen$: transformedSources.isPanelOpen$
  }
}

export default SourcesPanel
