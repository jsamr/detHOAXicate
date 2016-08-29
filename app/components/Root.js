import xs from 'xstream'
import { div } from '@cycle/dom'
import R from 'ramda'
import { splitHttpScope } from 'app/http-utils'

import Header from './Header'
import Frame from './Frame'
import TitleBar from './TitleBar'
import SourcesPanel from './SourcesPanel'

const hasSucceedParsing = R.curry(R.prop)('parseSuccess')
const getInnerHtml = R.curry(R.prop)('sanitizedArticleHtml')

function extractRootArticleInnherHtml (articleRepFlow$) {
  return articleRepFlow$.filter(hasSucceedParsing).map(getInnerHtml)
}

function transform (sources) {
  const { DOM, HTTP } = sources
  const { parseUrlResponse$, parseUrlError$ } = splitHttpScope('parse', HTTP)
  const articleInnerHtml$ = parseUrlResponse$.compose(extractRootArticleInnherHtml)
  const header = Header({ DOM, parseUrlError$, parseUrlResponse$ })
  const { selectedUrlSanitized$, parseUrlLoading$, isReadModeOn$ } = header
  const canShowDiagram$ = xs.combine(parseUrlLoading$, parseUrlResponse$).map(([isLoading, articleRep]) => !isLoading && !!articleRep).startWith(false)
  const titleBar = TitleBar({ DOM, parseUrlResponse$, canShowDiagram$ })
  const sourcesPanel = SourcesPanel({ DOM, parseUrlResponse$, parseUrlLoading$, canShowDiagram$ })
  const isPanelOpen$ = sourcesPanel.isPanelOpen$
  const frame = Frame({ DOM, selectedUrl$: selectedUrlSanitized$, articleInnerHtml$, isReadModeOn$, parseUrlResponse$, isPanelOpen$ })
  return {
    headerVdom$: header.DOM,
    titleBarVdom$: titleBar.DOM,
    frameVdom$: frame.DOM,
    sourcesPanelVdom$: sourcesPanel.DOM,
    HTTP: header.HTTP
  }
}

function model ({ headerVdom$, titleBarVdom$, frameVdom$, sourcesPanelVdom$ }) {
  return xs.combine(
    headerVdom$,
    titleBarVdom$,
    frameVdom$,
    sourcesPanelVdom$,
  ).map(([headerDom, titleBarDom, frameDom, sourcesTreeDom]) => ({
    headerDom,
    titleBarDom,
    frameDom,
    sourcesTreeDom
  }))
}

function view ({ headerDom, titleBarDom, frameDom, sourcesTreeDom }) {
  return div('#Root', [
    headerDom,
    titleBarDom,
    frameDom,
    sourcesTreeDom
  ])
}

function Root (sources) {
  const transformedSources = transform(sources)
  const state$ = model(transformedSources)
  const vdom$ = state$.map(view)
  return {
    DOM: vdom$,
    HTTP: transformedSources.HTTP
  }
}

export default Root
