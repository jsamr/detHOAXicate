import xs from 'xstream'
import { div } from '@cycle/dom'
import R from 'ramda'
import { isValidURL } from 'shared/validation'
import truthy from 'lodash/identity'

import { splitHttpScope } from 'app/http-utils'
import Header from './Header'
import Frame from './Frame'
import TitleBar from './TitleBar'
import SourcesPanel from './SourcesPanel'
import { complement } from 'shared/stream-utils'
const hasSucceedParsing = R.curry(R.prop)('parseSuccess')
const getInnerHtml = R.curry(R.prop)('sanitizedArticleHtml')

function extractRootArticleInnherHtml (articleRepFlow$) {
  return articleRepFlow$.filter(hasSucceedParsing).map(getInnerHtml)
}

function findParseErrors (res) {
  return res.parseSuccess ? null : { errorCode: res.errorCode }
}

function transform (sources) {
  const { DOM, HTTP } = sources
  const { parseUrlResponse$, parseUrlError$ } = splitHttpScope('parse', HTTP, findParseErrors)
  const articleInnerHtml$ = parseUrlResponse$.compose(extractRootArticleInnherHtml)
  const header = Header({ DOM, parseUrlError$, parseUrlResponse$ })
  const { selectedUrl$, isReadModeOn$ } = header
  const isInvalideUrl$ = selectedUrl$.map(isValidURL).compose(complement).filter(truthy)
  const canShowDiagram$ = xs.merge(
    parseUrlResponse$.mapTo(true),
    isInvalideUrl$.mapTo(false),
    parseUrlError$.mapTo(false)
  ).startWith(false)
  const titleBar = TitleBar({ DOM, parseUrlResponse$, canShowDiagram$ })
  const sourcesPanel = SourcesPanel({ DOM, parseUrlResponse$, canShowDiagram$ })
  const isPanelOpen$ = sourcesPanel.isPanelOpen$
  const frame = Frame({ DOM, selectedUrl$, articleInnerHtml$, isReadModeOn$, parseUrlResponse$, isPanelOpen$, canShowDiagram$ })
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
