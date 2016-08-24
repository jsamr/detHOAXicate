import Header from './Header'
import Frame from './Frame'
import Footer from './Footer'
import SourcesPanel from './SourcesPanel'
import xs from 'xstream'
import { div } from '@cycle/dom'
import Parse from '../api/Parse'
import { targetValue } from '../dom-utils'
import { isValidURL } from '../validation'

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

function Root ({ DOM, HTTP }) {
  const { parseUrlResponse, parseUrlError } = selectParseStreamRes(HTTP)
  // computed sources
  const selectedUrl = DOM.select('#UrlInput').events('input').map(targetValue).startWith('')
  const selectedUrlSanitized = selectedUrl.filter(isValidURL).startWith(null)
  const parseUrlReq = Parse({ selectedUrl: selectedUrlSanitized }).HTTP
  const parseUrlLoading = xs.merge(parseUrlReq.mapTo(true), parseUrlError.mapTo(false), parseUrlResponse.mapTo(false)).startWith(false)
  const canShowDiagram = xs.combine(parseUrlLoading, parseUrlResponse).map(([isLoading, articleRep]) => !isLoading && !!articleRep)
  // vdoms$
  const header = Header({ DOM, inputValue: selectedUrl, parseUrlLoading, parseUrlError, canShowDiagram })
  const frame = Frame({ selectedUrl: selectedUrlSanitized })
  const footer = Footer({ DOM })
  const sourcesTree = SourcesPanel({ parseUrlResponse, parseUrlLoading, parseUrlError, openPanel: header.openPanel })
  const vdom$ = xs.combine(header.DOM, frame.DOM, sourcesTree.DOM, footer.DOM)
    .map(([headerDom, frameDom, sourcesTree, footerDom]) => div('#Root', [
      headerDom,
      frameDom,
      sourcesTree,
      footerDom
    ]))
  return {
    DOM: vdom$,
    HTTP: parseUrlReq
  }
}

export default Root
