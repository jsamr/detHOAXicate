import { pre } from '@cycle/dom'
import R from 'ramda'

function model (sources) {
  return sources.articleRep$.map((articleRep) => R.omit('sanitizedArticleHtml', articleRep))
}

function view (articleRep) {
  return pre('#SourcesView', JSON.stringify(articleRep, null, 2))
}

function SourcesView (sources) {
  const state$ = model(sources)
  const vdom$ = state$.map(view)
  return {
    DOM: vdom$
  }
}

export default SourcesView
