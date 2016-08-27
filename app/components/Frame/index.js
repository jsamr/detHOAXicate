import { div } from '@cycle/dom'
import xs from 'xstream'

import { pausable, complement } from 'shared/stream-utils'
import ArticleReadMode from './ArticleReadMode'
import Fallback from './Fallback'
import EmbeddedExternalSite from './EmbeddedExternalSite'

function view ({ innerVdom, isPanelOpen }) {
  const attrs = { class: isPanelOpen ? 'is-collapsed' : 'is-expanded' }
  return div('#Frame', { attrs }, [ innerVdom ])
}

function transform (sources) {
  const { articleInnerHtml$, isReadModeOn$, ...otherSources } = sources
  const isReadModeOff$ = isReadModeOn$.compose(complement)
  const innerHtml$ = articleInnerHtml$
  return {
    isReadModeOff$,
    isReadModeOn$,
    innerHtml$,
    ...otherSources
  }
}

function model (sources) {
  const { selectedUrl$, innerHtml$, isReadModeOn$, isReadModeOff$, isPanelOpen$ } = sources
  const fallback = Fallback().DOM
  const articleReadMode = ArticleReadMode({ innerHtml$ }).DOM.compose(pausable(isReadModeOn$))
  const embeddedExternalSite = EmbeddedExternalSite({ selectedUrl$ }).DOM.compose(pausable(isReadModeOff$))
  const innerVdom$ = xs.merge(
    fallback,
    articleReadMode,
    embeddedExternalSite
  )
  return xs.combine(
    innerVdom$,
    isPanelOpen$
  ).map(([innerVdom, isPanelOpen]) => ({ innerVdom, isPanelOpen }))
}

/**
 * @param sources
 * @param {stream} sources.selectedUrl$ - a stream of urls
 * @param {stream} sources.articleInnerHtml$ - a stream of pure text html
 * @param {stream} sources.isPanelOpen$ - a stream of boolean
 * @param {stream} sources.isReadModeOn$ - a stream of boolean
 * @returns {{DOM: stream}}
 */
function Frame (sources) {
  const transformedSources = transform(sources)
  const state$ = model(transformedSources)
  const vdom$ = state$.map(view)
  return {
    DOM: vdom$
  }
}

export default Frame
