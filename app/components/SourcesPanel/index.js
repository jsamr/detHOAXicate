import { div } from '@cycle/dom'
import xs from 'xstream'
import isolate from '@cycle/isolate'

import SourcesView from './SourcesView'
import Header from './Header'
import Credits from './Credits'

function transform (sources) {
  const { DOM, parseUrlResponse$, ...otherSources } = sources
  const articleRep$ = parseUrlResponse$.startWith(null)
  const sourcesView = SourcesView({ DOM, articleRep$ })
  const header = Header(sources)
  const credits = Credits()
  const isPanelOpen$ = header.isPanelOpen$
  return {
    ...otherSources,
    sourcesViewVdom$: sourcesView.DOM,
    headerVdom$: header.DOM,
    creditsVdom$: credits.DOM,
    isPanelOpen$
  }
}

function model (sources) {
  const { sourcesViewVdom$, headerVdom$, isPanelOpen$, canShowDiagram$, creditsVdom$ } = sources
  const openState$ = xs.combine(
    isPanelOpen$,
    sourcesViewVdom$,
    headerVdom$,
    creditsVdom$,
    canShowDiagram$
  ).map(([isPanelOpen, sourcesViewDom, headerDom, creditsDom, canShowDiagram]) => ({ isPanelOpen, sourcesViewDom, headerDom, creditsDom, canShowDiagram }))
  return openState$
}

function view ({ isPanelOpen, creditsDom, sourcesViewDom, headerDom, canShowDiagram }) {
  return div('#SourcesPanel', {
    attrs: {
      class: `${isPanelOpen ? 'is-expanded' : 'is-small'}`
    }
  }, canShowDiagram ? [
    headerDom,
    div('#SourcesView_container', [
      sourcesViewDom
    ])
  ] : [ creditsDom ])
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

/**
 * A Component holding different representations of the article sources through diagrams
 * @param sources
 * @param sources.parseUrlResponse$ {stream} - a stream of objects with api/parse response
 * @param sources.canShowDiagram$ {stream} - a stream of boolean
 * @returns {{DOM: stream, isPanelOpen$: stream}}
 */
export default (sources) => isolate(SourcesPanel)(sources)
