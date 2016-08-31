import { div } from '@cycle/dom'
import xs from 'xstream'
import isolate from '@cycle/isolate'

import { pausable, complement } from 'shared/stream-utils'
import ArticleReadMode from './ArticleReadMode'
import Fallback from './Fallback'
import EmbeddedExternalSite from './EmbeddedExternalSite'
import ArticleInfos from './ArticleInfo'

function view ({ infoVdom, innerVdom, isPanelOpen }) {
  const attrs = { class: isPanelOpen ? 'is-collapsed' : 'is-expanded' }
  return div('#Frame', { attrs }, [ infoVdom, innerVdom ])
}

const falsy = (val) => !val

function transform (sources) {
  const { DOM, articleInnerHtml$, isReadModeOn$, parseUrlResponse$, canShowDiagram$, ...otherSources } = sources
  const isReadModeOff$ = isReadModeOn$.compose(complement)
  const innerHtml$ = articleInnerHtml$
  const articleInfos = ArticleInfos({ DOM, parseUrlResponse$ })
  const articleInfosVdom$ = canShowDiagram$.map((canShow) => canShow ? articleInfos.DOM : xs.of(null)).flatten()
  return {
    isReadModeOff$,
    isReadModeOn$,
    canShowDiagram$,
    innerHtml$,
    articleInfosVdom$,
    ...otherSources
  }
}

function model (sources) {
  const { selectedUrl$, innerHtml$, isReadModeOn$, isReadModeOff$, isPanelOpen$, articleInfosVdom$, canShowDiagram$ } = sources
  const fallback = Fallback()
  const fallbackVdom$ = canShowDiagram$.filter(falsy).map(() => fallback.DOM).flatten()
  const articleReadModeVdom$ = ArticleReadMode({ innerHtml$ }).DOM.compose(pausable(isReadModeOn$))
  const embeddedExternalSiteVdom$ = EmbeddedExternalSite({ selectedUrl$ }).DOM.compose(pausable(isReadModeOff$))
  const innerVdom$ = xs.merge(
    fallbackVdom$,
    articleReadModeVdom$,
    embeddedExternalSiteVdom$
  )
  return xs.combine(
    articleInfosVdom$,
    innerVdom$,
    isPanelOpen$
  ).map(([infoVdom, innerVdom, isPanelOpen]) => ({ infoVdom, innerVdom, isPanelOpen }))
}

function Frame (sources) {
  const transformedSources = transform(sources)
  const state$ = model(transformedSources)
  const vdom$ = state$.map(view)
  return {
    DOM: vdom$
  }
}

/**
 * A Component displaying the content of the article or the original website + its meta-info
 * @param sources
 * @param {stream} sources.selectedUrl$ - a stream of urls
 * @param {stream} sources.articleInnerHtml$ - a stream of pure text html
 * @param {stream} sources.isReadModeOn$ - a stream of boolean
 * @param {stream} sources.isPanelOpen$ - a stream of boolean
 * @param {stream} sources.canShowDiagram$ - a stream of boolean
 * @param {stream} sources.parseUrlResponse$ - a stream of responses from the api/parse request
 * @param {stream} sources.DOM - the DOM driver
 * @returns {{DOM: stream}}
 */
export default (sources) => isolate(Frame)(sources)
