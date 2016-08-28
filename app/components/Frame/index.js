import { div } from '@cycle/dom'
import xs from 'xstream'

import { pausable, complement } from 'shared/stream-utils'
import ArticleReadMode from './ArticleReadMode'
import Fallback from './Fallback'
import EmbeddedExternalSite from './EmbeddedExternalSite'
import ArticleActions from './ArticleActions'

function view ({ articleVdom, innerVdom, isPanelOpen }) {
  const attrs = { class: isPanelOpen ? 'is-collapsed' : 'is-expanded' }
  return div('#Frame', { attrs }, [ innerVdom, articleVdom ])
}

function transform (sources) {
  const { DOM, articleInnerHtml$, isReadModeOn$, canShowDiagram$, parseUrlResponse$, ...otherSources } = sources
  const isReadModeOff$ = isReadModeOn$.compose(complement)
  const innerHtml$ = articleInnerHtml$
  const articleActions = ArticleActions({ DOM, canShowDiagram$, parseUrlResponse$ })
  const articleActionsVdom$ = articleActions.DOM
  const isPanelOpen$ = articleActions.isPanelOpen$
  return {
    isReadModeOff$,
    isReadModeOn$,
    innerHtml$,
    articleActionsVdom$,
    isPanelOpen$,
    ...otherSources
  }
}

function model (sources) {
  const { selectedUrl$, innerHtml$, isReadModeOn$, isReadModeOff$, isPanelOpen$, articleActionsVdom$ } = sources
  const fallback = Fallback().DOM
  const articleReadMode = ArticleReadMode({ innerHtml$ }).DOM.compose(pausable(isReadModeOn$))
  const embeddedExternalSite = EmbeddedExternalSite({ selectedUrl$ }).DOM.compose(pausable(isReadModeOff$))
  const innerVdom$ = xs.merge(
    fallback,
    articleReadMode,
    embeddedExternalSite
  )
  return xs.combine(
    articleActionsVdom$,
    innerVdom$,
    isPanelOpen$
  ).map(([articleVdom, innerVdom, isPanelOpen]) => ({ articleVdom, innerVdom, isPanelOpen }))
}

/**
 * @param sources
 * @param {stream} sources.selectedUrl$ - a stream of urls
 * @param {stream} sources.articleInnerHtml$ - a stream of pure text html
 * @param {stream} sources.canShowDiagram$ - a stream of boolean
 * @param {stream} sources.isReadModeOn$ - a stream of boolean
 * @param {stream} sources.DOM - the DOM driver
 * @returns {{DOM: stream, isPanelOpen$: stream}}
 */
function Frame (sources) {
  const transformedSources = transform(sources)
  const state$ = model(transformedSources)
  const vdom$ = state$.map(view)
  return {
    DOM: vdom$,
    isPanelOpen$: transformedSources.isPanelOpen$
  }
}

export default Frame
