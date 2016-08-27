import { iframe, div } from '@cycle/dom'
import xs from 'xstream'

function makeIframe (selectedUrl, attrs) {
  return iframe('#Frame', { attrs: {
    src: selectedUrl,
    name: 'iframe',
    sandbox: undefined,
    frameBorder: '0',
    ...attrs
    }
  })
}

function makeFallbackDiv (attrs) {
  return div('#Frame', { attrs }, [
    div('Welcome to detHOAXicate!'),
    div('Paste a link to start detHOAXicating information')
  ])
}

function makeLintArticle (htmlString, attrs) {
  const insertArticleReadModeIframe = (vnode) => {
    const doc = vnode.elm.contentWindow.document
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
  vdom = div('#Frame', { attrs }, [
    div('#Article', [
      iframe('#Article_body', {
        hook: {
          update: insertArticleReadModeIframe,
          insert: insertArticleReadModeIframe
        },
        attrs: {
          src: 'about:blank',
          frameBorder: '0'
        }
      })
    ])
  ])
  return vdom
}

function renderFrame ({ innerHtml, selectedUrl, readModeOn, isPanelOpen }) {
  const attrs = isPanelOpen ? { class: 'is-collapsed' } : { class: 'is-expanded' }
  return readModeOn ? makeLintArticle(innerHtml, attrs) : (selectedUrl ? makeIframe(selectedUrl, attrs) : makeFallbackDiv(attrs))
}

function view (state$) {
  return state$.map(renderFrame).startWith(makeFallbackDiv())
}

function model (sources) {
  const { selectedUrl$, rootArticleInnherHtmlStream$, readMode$, isPanelOpen$ } = sources
  return xs.combine(
    rootArticleInnherHtmlStream$,
    selectedUrl$,
    readMode$,
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
  const vdom$ = view(state$)
  return {
    DOM: vdom$
  }
}

export default Frame
