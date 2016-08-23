import Header from './Header'
import Frame from './Frame'
import Footer from './Footer'
import SourcesTree from './SourcesTree'
import xs from 'xstream'
import { div } from '@cycle/dom'
import Parse from '../api/Parse'

function Root ({ DOM, HTTP }) {
  const parseUrlResponse = HTTP.select('parse').flatten().startWith(null).map(res => res ? JSON.parse(res.text) : null)
  const header = Header({ DOM, selectedUrl: 'http://www.bbc.com/news/world-europe-37147717' })
  const selectedUrl = header.value
  const parseUrlReq = Parse({ selectedUrl }).HTTP
  const parseUrlLoading = xs.merge(parseUrlReq, parseUrlResponse).fold((acc, next) => !acc, false)
  const frame = Frame({ selectedUrl })
  const footer = Footer({ DOM })
  const sourcesTree = SourcesTree({ parseUrlResponse, parseUrlLoading })
  const vdom$ = xs.combine(header.DOM, frame.DOM, footer.DOM, sourcesTree.DOM)
    .map(([headerDom, frameDom, footerDom, sourcesTree]) => div('#Root', [
      headerDom,
      frameDom,
      footerDom,
      sourcesTree
    ]))
  return {
    DOM: vdom$,
    HTTP: parseUrlReq
  }
}

export default Root
