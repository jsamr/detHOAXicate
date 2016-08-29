import { div, i, a, span } from '@cycle/dom'
import xs from 'xstream'

function intent (DOM) {
  return {
    isExpanded$: DOM.select('#InfoToggle').events('click').fold((acc) => !acc, true)
  }
}

function renderToggleChevron (isExtended) {
  return div('#InfoToggle', isExtended ? [
    i('.fa.fa-chevron-down'),
    span('.label', 'CLOSE INFO PANEL')
  ] : [
    i('.fa.fa-chevron-up'),
    span('label', 'OPEN INFO PANEL')
  ])
}

function renderTime (label, time) {
  return div(`#${label}`, { attrs: { class: 'timeItem' } }, [
    span('.label', label),
    span('.date', new Date(time).toLocaleString())
  ])
}

function model (sources) {
  const { parseUrlResponse$, isExpanded$ } = sources
  return xs.combine(
    parseUrlResponse$,
    isExpanded$
  ).map(([resp, isExpanded]) => ({ resp, isExpanded }))
}

function view ({ resp, isExpanded }) {
  const { metaInfo, url } = resp
  const {
    authors,
    image,
    description,
    provider,
    publishedTime,
    modifiedTime
  } = metaInfo || {}
  return div('#ArticleInfo', { attrs: { class: isExpanded ? 'is-expanded' : 'is-collapsed' } }, [
    renderToggleChevron(isExpanded),
    div('.header', [
      i('.fa.fa-info-circle'),
      provider ? div(provider) : null
    ]),
    authors ? div('.authors', authors.map((a) => div('.author', [a]))) : null,
    div('.time', [
      publishedTime ? renderTime('published', publishedTime) : null,
      modifiedTime ? renderTime('modified', modifiedTime) : null
    ]),
    a('#Origin', { attrs: { class: 'link', href: url, target: '_blank' } }, [ 'OPEN ORIGINAL LINK', i('.fa.fa-external-link') ]),
    div('.title', {
      style: {
        background: image ? `url(${image})` : 'inherit'
      }
    }, [
      description ? div('.description', [description]) : null
    ])
  ])
}

function ArticleInfo (sources) {
  const intents = intent(sources.DOM)
  const $state = model({ ...sources, ...intents })
  const vdom$ = $state.map(view).startWith(null)
  return {
    DOM: vdom$
  }
}

export default ArticleInfo
