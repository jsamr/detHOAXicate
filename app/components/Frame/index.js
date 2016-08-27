import { iframe, div } from '@cycle/dom'
import xs from 'xstream'

function renderExternalSite (selectedUrl) {
  return [ iframe('#Article', {
    attrs: {
      src: selectedUrl,
      name: 'iframe',
      sandbox: undefined,
      frameBorder: '0'
  }})
  ]
}

function renderFallback () {
  return [
    div('Welcome to detHOAXicate!'),
    div('Paste a link to start detHOAXicating information')
  ]
}

function renderReadModeArticle (htmlString) {
  // this function injects html in the iframe
  const injectArticleReadModeIframe = (vnode) => {
    const doc = vnode.elm.contentWindow.document
    // TODO prevent costly (+ blinking screen) updates when the component class changes
    doc.open()
    doc.write(htmlString)
    doc.close()
    const link = doc.createElement('link')
    // TODO get the appropriate root URL
    link.setAttribute('href', 'http://localhost:3000/public/read-mode-article.css')
    link.setAttribute('type', 'text/css')
    link.setAttribute('rel', 'stylesheet')
    doc.head.appendChild(link)
  }
  let vdom
  vdom = [
    div('#Article', [
      iframe('#Article_body', {
        hook: {
          update: injectArticleReadModeIframe,
          insert: injectArticleReadModeIframe
        },
        attrs: {
          src: 'about:blank',
          frameBorder: '0'
        }
      })
    ])
  ]
  return vdom
}

function view ({ innerHtml, selectedUrl, readModeOn, isPanelOpen }) {
  const attrs = isPanelOpen ? { class: 'is-collapsed' } : { class: 'is-expanded' }
  const innerElem = innerHtml ? (readModeOn ? renderReadModeArticle(innerHtml) : renderExternalSite(selectedUrl)) : renderFallback()
  return div('#Frame', { attrs }, innerElem)
}

function model (sources) {
  const { selectedUrl$, rootArticleInnherHtmlStream$, isReadModeOn$, isPanelOpen$ } = sources
  return xs.combine(
    rootArticleInnherHtmlStream$.startWith(null),
    selectedUrl$,
    isReadModeOn$,
    isPanelOpen$
  ).map(([innerHtml, selectedUrl, readModeOn, isPanelOpen]) => ({ innerHtml, selectedUrl, readModeOn, isPanelOpen }))
}

/**
 * @param sources
 * @param {stream} sources.selectedUrl$ - a stream of urls
 * @returns {{DOM: stream}}
 * @constructor
 */
function Frame (sources) {
  const state$ = model(sources)
  const vdom$ = state$.map(view)
  return {
    DOM: vdom$
  }
}

export default Frame
