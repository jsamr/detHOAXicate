import { div, i } from '@cycle/dom'
import xs from 'xstream'

function model (sources) {
  const { parseUrlResponse$, isExpanded$ } = sources
  return xs.combine(
    parseUrlResponse$,
    isExpanded$
  ).map(([resp, isExpanded]) => ({ resp, isExpanded }))
}

function view ({ resp, isExpanded }) {
  const { metaInfo, url } = resp
  console.info('META INFO', metaInfo)
  return div('#ArticleInfo', { attrs: { class: isExpanded ? 'is-expanded' : 'is-collapsed' } }, [
    div('.title', {
      style: {
        background: `url(${metaInfo.image})`
      }
    }),
    div('.description', [metaInfo.description])
  ])
}

function ArticleInfo (sources) {
  const $state = model(sources)
  const vdom$ = $state.map(view).startWith(null)
  return {
    DOM: vdom$
  }
}

export default ArticleInfo
