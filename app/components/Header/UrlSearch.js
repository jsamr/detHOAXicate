import { input, div, i } from '@cycle/dom'
import xs from 'xstream'
import isolate from '@cycle/isolate'

import { isValidURL } from 'shared/validation'
import { toggle } from 'shared/stream-utils'
import { targetValue } from 'app/dom-utils'

const httpRegex = /^http[s]?:\/\//
const httpRegexExact = /^http[s]?:\/\/$/

function renderUrlError () {
  return [
    i('.is-warn .fa .fa-warning'),
    div('.feedbacktip', [ div('.arrow-up'), 'The link is not of the expected format. Must be an URL.' ])
  ]
}

function renderUrlValidation (url) {
  return div(
    url && !httpRegexExact.test(url) ? ((isValidURL(url)) ? [ i('.is-success .fa .fa-check', { attrs: { title: 'This link is well-formatted' } }) ] : renderUrlError()) : [ null ]
  )
}

function renderReadModeToggle (readModeOn) {
  return div('#ReadModeToggle', { attrs: { class: `UrlSearch_feedback ${readModeOn ? '' : 'disabled'}`, title: readModeOn ? 'Read mode is on. Click to disable' : 'Read mode is off. click to enable' } }, [ i('.icon-book-open') ])
}

function sanitizeUrl (url) {
  return httpRegex.test(url) ? url : 'http://' + url
}

function intent (DOM) {
  const selectedUrl$ = DOM.select('#UrlInput').events('input').map(targetValue).startWith('').map(sanitizeUrl)
  const isReadModeOn$ = DOM.select('#ReadModeToggle').events('click').compose(toggle(true))
  const selectedUrlSanitized$ = selectedUrl$.filter(isValidURL).startWith(null)
  return {
    isReadModeOn$,
    selectedUrl$,
    selectedUrlSanitized$
  }
}

function model (sources) {
  const { selectedUrl$, isReadModeOn$ } = sources
  return xs
    .combine(selectedUrl$, isReadModeOn$)
    .map(([url, isReadModeOn]) => ({ url, isReadModeOn }))
}

function view ({ url, isReadModeOn }) {
  // display an url which protocol (http:// or https://) has been stripped off
  const protocolLessUrl = url.replace(httpRegex, '')
  return div('#UrlSearch', [
    div('.UrlSearch_feedback', { attrs: { class: 'UrlSearch_feedback' } }, [ i('.is-info.fa.fa-search') ]),
    div('#UrlFeedback', { attrs: { class: 'UrlSearch_feedback' } }, [ renderUrlValidation(url) ]),
    input('#UrlInput', {
      hook: { update: (vdom) => {
        vdom.elm.value = protocolLessUrl
      }},
      attrs: { type: 'text', value: protocolLessUrl, autofocus: true, placeholder: 'Type a link to generate a source diagram from' }
    }),
    renderReadModeToggle(isReadModeOn)
  ])
}

function UrlSearch (sources) {
  const intents = intent(sources.DOM)
  const state$ = model(intents)
  const vnode$ = state$.map(view)
  return {
    DOM: vnode$,
    selectedUrlSanitized$: intents.selectedUrlSanitized$,
    selectedUrl$: intents.selectedUrl$,
    isReadModeOn$: intents.isReadModeOn$
  }
}

/**
 * @param sources
 * @param sources.DOM - the DOM driver
 * @returns {{DOM: stream, selectedUrlSanitized$: stream, selectedUrl$: stream, isReadModeOn$: stream}}
 */
export default (sources) => isolate(UrlSearch)(sources)
