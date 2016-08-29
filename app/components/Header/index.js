import { input, div, span, i } from '@cycle/dom'
import xs from 'xstream'

import Parse from 'app/api/Parse'
import { isValidURL } from 'shared/validation'
import { targetValue } from 'app/dom-utils'

// TODO refactor in sub Components

function renderUrlValidation (url) {
  if (url) return isValidURL(url) ? i('.success .fa .fa-check') : i('.error .fa .fa-warning')
  else return i('.info.fa.fa-search')
}

function renderLoadingIcon () {
  return div('.flex-inline-centered', [ i('.icon-spin6 .icon-spin') ])
}

function renderErrorIcon () {
  return div('.flex-column-centered', [
    i('.fa.fa-warning.error'),
    span('.font-small', 'detHOAXicate could not parse this link. Please try an other link')
  ])
}

function renderReadModeToggle (readModeOn) {
  return div('#ReadModeToggle', { attrs: { class: `UrlSearch_feedback ${readModeOn ? '' : 'disabled'}` } }, [ i('.icon-book-open') ])
}

function transform (sources) {
  const { parseUrlError$, parseUrlResponse$, selectedUrlSanitized$ } = sources
  const parseUrlReq$ = Parse({ url$: selectedUrlSanitized$ }).HTTP
  const parseUrlLoading$ = xs.merge(
    parseUrlReq$.mapTo(true),
    parseUrlError$.mapTo(false),
    parseUrlResponse$.mapTo(false)
  ).startWith(false)
  return {
    parseUrlLoading$,
    parseUrlReq$,
    ...sources
  }
}

function view ({ url, isLoading, error, feedback, readModeOn }) {
  return div('#Header', [
    div('#Title', [ 'detHOAXicate', div('#Subtitle', 'the hoax decompiler') ]),
    div('#UrlSearch', [
      div('#UrlFeedback', { attrs: { class: 'UrlSearch_feedback' } }, [ renderUrlValidation(url) ]),
      input('#UrlInput', { attrs: { type: 'text', value: url, autofocus: true, placeholder: 'Type a link to generate a source diagram from' } }),
      renderReadModeToggle(readModeOn)
    ]),
    div('.feedback', [
      isLoading ? renderLoadingIcon() : feedback
    ])
  ])
}

function intent (DOM) {
  const selectedUrl$ = DOM.select('#UrlInput').events('input').map(targetValue).startWith('')
  const isReadModeOn$ = DOM.select('#ReadModeToggle').events('click').fold((acc, next) => !acc, true)
  const selectedUrlSanitized$ = selectedUrl$.filter(isValidURL).startWith(null)
  return {
    isReadModeOn$,
    selectedUrl$,
    selectedUrlSanitized$
  }
}

function model (sources) {
  const { selectedUrl$, parseUrlLoading$, parseUrlError$, isReadModeOn$ } = sources
  const feedbackDom$ = xs.merge(selectedUrl$.mapTo(null), parseUrlError$.map(renderErrorIcon))
  const state$ = xs.combine(
    selectedUrl$,
    parseUrlLoading$,
    parseUrlError$.startWith(null),
    feedbackDom$,
    isReadModeOn$
  ).map(([url, isLoading, error, feedback, readModeOn]) => ({ url, isLoading, error, feedback, readModeOn }))
  return state$
}

function Header (sources) {
  const intents = intent(sources.DOM)
  const transformedSources = transform({ ...intents, ...sources })
  const state$ = model(transformedSources)
  const vdom$ = state$.map(view)
  return {
    DOM: vdom$,
    HTTP: transformedSources.parseUrlReq$,
    selectedUrl$: transformedSources.selectedUrl$,
    selectedUrlSanitized$: transformedSources.selectedUrlSanitized$,
    parseUrlLoading$: transformedSources.parseUrlLoading$,
    isReadModeOn$: transformedSources.isReadModeOn$
  }
}

export default Header
