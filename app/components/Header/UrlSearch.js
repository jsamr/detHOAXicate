import { input, div, i } from '@cycle/dom'
import xs from 'xstream'
import isolate from '@cycle/isolate'

import { isValidURL } from 'shared/validation'
import { toggle } from 'shared/stream-utils'
import { targetValue } from 'app/dom-utils'

function renderUrlValidation (url) {
  if (url) return isValidURL(url) ? i('.success .fa .fa-check') : i('.error .fa .fa-warning')
  else return i('.info.fa.fa-search')
}

function renderReadModeToggle (readModeOn) {
  return div('#ReadModeToggle', { attrs: { class: `UrlSearch_feedback ${readModeOn ? '' : 'disabled'}` } }, [ i('.icon-book-open') ])
}

function intent (DOM) {
  const selectedUrl$ = DOM.select('#UrlInput').events('input').map(targetValue).startWith('')
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
  return div('#UrlSearch', [
    div('#UrlFeedback', { attrs: { class: 'UrlSearch_feedback' } }, [ renderUrlValidation(url) ]),
    input('#UrlInput', { attrs: { type: 'text', value: url, autofocus: true, placeholder: 'Type a link to generate a source diagram from' } }),
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
