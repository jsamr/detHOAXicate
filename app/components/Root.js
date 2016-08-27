import Header from './Header'
import Frame from './Frame'
import Footer from './Footer'
import TitleBar from './TitleBar'
import SourcesPanel from './SourcesPanel'
import xs from 'xstream'
import { div } from '@cycle/dom'
import Parse from '../api/Parse'
import { targetValue } from '../dom-utils'
import { isValidURL } from 'shared/validation'
import R from 'ramda'
import { splitHttpScope } from 'app/http-utils'

function extractRootArticleInnherHtml (articleRepFlow$) {
  const hasSucceedParsing = R.curry(R.prop)('parseSuccess')
  const getInnerHtml = R.curry(R.prop)('sanitizedArticleHtml')
  return articleRepFlow$.filter(hasSucceedParsing).map(getInnerHtml)
}

function intent (DOM, HTTP) {
  const { parseUrlResponse$, parseUrlError$ } = splitHttpScope('parse', HTTP)
  const selectedUrl$ = DOM.select('#UrlInput').events('input').map(targetValue).startWith('')
  const selectedUrlSanitized$ = selectedUrl$.filter(isValidURL).startWith(null)
  const rootArticleInnherHtmlStream$ = parseUrlResponse$.compose(extractRootArticleInnherHtml)
  const parseUrlReq$ = Parse({ selectedUrl$: selectedUrlSanitized$ }).HTTP
  const parseUrlLoading$ = xs.merge(parseUrlReq$.mapTo(true), parseUrlError$.mapTo(false), parseUrlResponse$.mapTo(false)).startWith(false)
  return {
    parseUrlResponse$,
    rootArticleInnherHtmlStream$,
    parseUrlError$,
    selectedUrl$,
    selectedUrlSanitized$,
    parseUrlReq$,
    parseUrlLoading$
  }
}

function model (sources) {
  const { DOM, selectedUrl$, selectedUrlSanitized$, parseUrlResponse$, parseUrlError$, rootArticleInnherHtmlStream$, parseUrlLoading$ } = sources
  const canShowDiagram$ = xs.combine(parseUrlLoading$, parseUrlResponse$).map(([isLoading, articleRep]) => !isLoading && !!articleRep)
  const header = Header({ DOM, inputValue: selectedUrl$, parseUrlLoading$, parseUrlError$ })
  const titleBar = TitleBar({ DOM, parseUrlResponse$, canShowDiagram$ })
  const isPanelOpen$ = titleBar.isPanelOpen$
  const isReadModeOn$ = header.isReadModeOn$
  const frame = Frame({ selectedUrl$: selectedUrlSanitized$, rootArticleInnherHtmlStream$, isReadModeOn$, isPanelOpen$ })
  const sourcesPanel = SourcesPanel({ parseUrlResponse$, parseUrlLoading$, isPanelOpen$ })
  const footer = Footer({ DOM })
  return xs.combine(
    header.DOM,
    titleBar.DOM,
    frame.DOM,
    sourcesPanel.DOM,
    footer.DOM
  ).map(([headerDom, titleBarDom, frameDom, sourcesTreeDom, footerDom]) => ({
    headerDom,
    titleBarDom,
    frameDom,
    sourcesTreeDom,
    footerDom
  }))
}

function view (state$) {
  return state$.map(({ headerDom, titleBarDom, frameDom, sourcesTreeDom, footerDom }) => div('#Root', [
    headerDom,
    titleBarDom,
    frameDom,
    sourcesTreeDom,
    footerDom
  ]))
}

function Root ({ DOM, HTTP }) {
  const transformedSources = { ...intent(DOM, HTTP), DOM }
  const { parseUrlReq$ } = transformedSources
  const state$ = model(transformedSources)
  const vdom$ = view(state$)
  return {
    DOM: vdom$,
    HTTP: parseUrlReq$
  }
}

export default Root
