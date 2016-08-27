import Header from './Header'
import Frame from './Frame'
import Footer from './Footer'
import TitleBar from './TitleBar'
import SourcesPanel from './SourcesPanel'
import xs from 'xstream'
import { div } from '@cycle/dom'
import R from 'ramda'
import { splitHttpScope } from 'app/http-utils'

function extractRootArticleInnherHtml (articleRepFlow$) {
  const hasSucceedParsing = R.curry(R.prop)('parseSuccess')
  const getInnerHtml = R.curry(R.prop)('sanitizedArticleHtml')
  return articleRepFlow$.filter(hasSucceedParsing).map(getInnerHtml)
}

function transform (sources) {
  const { DOM, HTTP } = sources
  const { parseUrlResponse$, parseUrlError$ } = splitHttpScope('parse', HTTP)
  const rootArticleInnherHtmlStream$ = parseUrlResponse$.compose(extractRootArticleInnherHtml)
  const header = Header({ DOM, parseUrlError$, parseUrlResponse$ })
  const { selectedUrlSanitized$, parseUrlLoading$, isReadModeOn$ } = header
  const canShowDiagram$ = xs.combine(parseUrlLoading$, parseUrlResponse$).map(([isLoading, articleRep]) => !isLoading && !!articleRep)
  const titleBar = TitleBar({ DOM, parseUrlResponse$, canShowDiagram$ })
  const isPanelOpen$ = titleBar.isPanelOpen$
  const frame = Frame({ selectedUrl$: selectedUrlSanitized$, rootArticleInnherHtmlStream$, isReadModeOn$, isPanelOpen$ })
  const sourcesPanel = SourcesPanel({ DOM, parseUrlResponse$, parseUrlLoading$, isPanelOpen$ })
  const footer = Footer({ DOM })
  return {
    headerVdom$: header.DOM,
    titleBarVdom$: titleBar.DOM,
    frameVdom$: frame.DOM,
    sourcesPanelVdom$: sourcesPanel.DOM,
    footerVdom$: footer.DOM,
    HTTP: header.HTTP
  }
}

function model ({ headerVdom$, titleBarVdom$, frameVdom$, sourcesPanelVdom$, footerVdom$ }) {
  return xs.combine(
    headerVdom$,
    titleBarVdom$,
    frameVdom$,
    sourcesPanelVdom$,
    footerVdom$
  ).map(([headerDom, titleBarDom, frameDom, sourcesTreeDom, footerDom]) => ({
    headerDom,
    titleBarDom,
    frameDom,
    sourcesTreeDom,
    footerDom
  }))
}

function view ({ headerDom, titleBarDom, frameDom, sourcesTreeDom, footerDom }) {
  return div('#Root', [
    headerDom,
    titleBarDom,
    frameDom,
    sourcesTreeDom,
    footerDom
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
