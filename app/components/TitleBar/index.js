import { div } from '@cycle/dom'

function view (ans) {
  const { metaInfo } = ans || {}
  const { title } = metaInfo || {}
  return div('#TitleBar', { attrs: { class: metaInfo ? 'is-expanded' : 'is-collapsed' } }, [
    div('.title', [
      title || '?[Title not found]'
    ])
  ])
}

function model (sources) {
  const { parseUrlResponse$ } = sources
  const metaInfoStream$ = parseUrlResponse$.filter((ans) => ans && ans.parseSuccess).startWith(null)
  return metaInfoStream$
}

function TitleBar (sources) {
  const state$ = model(sources)
  const vdom$ = state$.map(view)
  return {
    DOM: vdom$
  }
}

export default TitleBar
