import { iframe, div } from '@cycle/dom'

function model (sources) {
  const { innerHtml$ } = sources
  return innerHtml$
}

function view (htmlString) {
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
  vdom = div('#Article', [
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
  return vdom
}

/**
 * @param sources
 * @param sources.innerHtml$ - a stream of string holding the pure html to be mounted
 * @returns {{DOM: stream}}
 * @constructor
 */
function ArticleReadMode (sources) {
  const $state = model(sources)
  const vdom$ = $state.map(view)
  return {
    DOM: vdom$
  }
}

export default ArticleReadMode
