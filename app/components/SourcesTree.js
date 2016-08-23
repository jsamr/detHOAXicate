import {div, pre, i } from '@cycle/dom'
import xs from 'xstream'

function SourcesTree ({ parseUrlResponse, parseUrlLoading }) {
  // TODO handle error, see http://staltz.com/xstream/#replaceError
  const vdom$ = xs.combine(parseUrlResponse, parseUrlLoading).map(([articleRep, isLoading]) => {
    console.info('ARTICLE REP', articleRep, 'IS LOADING', isLoading)
    if (articleRep) {
      return div('#SourcesTree_container', [
        div('#SourcesTree', [
          div('#SourceTree_header', 'Sources Diagram'),
          pre('', JSON.stringify(articleRep, null, 2))
        ])
      ])
    } else {
      if (isLoading) {
        return div('#SourcesTree_container', [
          div('#Loader', [ i('.fa .fa-spinner .fa-spin') ])
        ])
      } else return null
    }
  })
  return {
    DOM: vdom$
  }
}

export default SourcesTree
