import Header from './Header'
import Frame from './Frame'
import Footer from './Footer'
import TitleBar from './TitleBar'
import SourcesPanel from './SourcesPanel'
import xs from 'xstream'
import { div } from '@cycle/dom'
import Parse from '../api/Parse'
import { targetValue } from '../dom-utils'
import { isValidURL } from '../validation'
import R from 'ramda'
import identity from 'lodash/identity'

let failure = r$ => r$.drop().replaceError(xs.of)
let success = r$ => r$.replaceError(xs.empty)

function selectParseStreamRes (HTTP) {
  const baseStreamSuccess$ = HTTP.select('parse').map(success).flatten()
  const baseStreamFailure$ = HTTP.select('parse').map(failure).flatten()
  return {
    parseUrlResponse: baseStreamSuccess$.map(res => res ? JSON.parse(res.text) : null),
    parseUrlError: baseStreamFailure$
  }
}

function extractRootArticleInnherHtml (articleRepFlow$) {
  const hasSucceedParsing = R.curry(R.prop)('parseSuccess')
  const getInnerHtml = R.curry(R.prop)('sanitizedArticleHtml')
  return articleRepFlow$.filter(hasSucceedParsing).map(getInnerHtml)
}

function Root ({ DOM, HTTP }) {
  const { parseUrlResponse, parseUrlError } = selectParseStreamRes(HTTP)
  // computed sources
  const selectedUrl$ = DOM.select('#UrlInput').events('input').map(targetValue).startWith('')
  const selectedUrlSanitized$ = selectedUrl$.filter(isValidURL).startWith(null)

  const parseUrlReq$ = Parse({ selectedUrl$: selectedUrlSanitized$ }).HTTP
  const parseUrlLoading = xs.merge(parseUrlReq$.mapTo(true), parseUrlError.mapTo(false), parseUrlResponse.mapTo(false)).startWith(false)
  const canShowDiagram = xs.combine(parseUrlLoading, parseUrlResponse).map(([isLoading, articleRep]) => !isLoading && !!articleRep)
  // vdoms$
  const header = Header({ DOM, inputValue: selectedUrl$, parseUrlLoading, parseUrlError, canShowDiagram })
  const rootArticleInnherHtmlStream$ = parseUrlResponse.compose(extractRootArticleInnherHtml)
  const titleBar = TitleBar({ DOM, parseUrlResponse, canShowDiagram })
  const frame = Frame({ selectedUrl$: selectedUrlSanitized$, rootArticleInnherHtmlStream$, readMode$: header.readModeEnabled, isPanelOpen$: titleBar.isPanelOpen })
  const footer = Footer({ DOM })
  const sourcesTree = SourcesPanel({ parseUrlResponse, parseUrlLoading, parseUrlError, openPanel: titleBar.isPanelOpen })
  const vdom$ = xs.combine(header.DOM, titleBar.DOM, frame.DOM, sourcesTree.DOM, footer.DOM)
    .map(([headerDom, titleBarDom, frameDom, sourcesTreeDom, footerDom]) => div('#Root', [
      headerDom,
      titleBarDom,
      frameDom,
      sourcesTreeDom,
      footerDom
    ]))
  return {
    DOM: vdom$,
    HTTP: parseUrlReq$
  }
}

export default Root
