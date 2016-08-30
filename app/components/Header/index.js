import { input, div, span, i } from '@cycle/dom'
import xs from 'xstream'

import Parse from 'app/api/Parse'
import { isValidURL } from 'shared/validation'
import { toggle } from 'shared/stream-utils'
import { targetValue } from 'app/dom-utils'
import NumberPicker from '../../generics/NumberPicker'

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
  const { parseUrlError$, parseUrlResponse$, selectedUrlSanitized$, DOM } = sources
  const depthPicker = NumberPicker({ DOM }, 'DepthPicker', { legend: 'depth', min: 0, max: 6 })
  const depth$ = depthPicker.number$
  const depthPickerVdom$ = depthPicker.DOM
  const parseUrlReq$ = Parse({ url$: selectedUrlSanitized$, depth$ }).HTTP
  const parseUrlLoading$ = xs.merge(
    parseUrlReq$.mapTo(true),
    parseUrlError$.mapTo(false),
    parseUrlResponse$.mapTo(false)
  ).startWith(false)
  return {
    DOM,
    depth$,
    depthPickerVdom$,
    parseUrlLoading$,
    parseUrlReq$,
    ...sources
  }
}

function view ({ url, isLoading, error, feedback, readModeOn, depthPickerVdom }) {
  return div('#Header', [
    div('#Title', [ 'detHOAXicate', div('#Subtitle', 'the hoax decompiler') ]),
    div('#UrlSearch', [
      div('#UrlFeedback', { attrs: { class: 'UrlSearch_feedback' } }, [ renderUrlValidation(url) ]),
      input('#UrlInput', { attrs: { type: 'text', value: url, autofocus: true, placeholder: 'Type a link to generate a source diagram from' } }),
      renderReadModeToggle(readModeOn)
    ]),
    depthPickerVdom,
    div('.feedback', [
      isLoading ? renderLoadingIcon() : feedback
    ])
  ])
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
  const { selectedUrl$, parseUrlLoading$, parseUrlError$, isReadModeOn$, depthPickerVdom$ } = sources
  const feedbackDom$ = xs.merge(selectedUrl$.mapTo(null), parseUrlError$.map(renderErrorIcon))
  const state$ = xs.combine(
    selectedUrl$,
    parseUrlLoading$,
    parseUrlError$.startWith(null),
    feedbackDom$,
    isReadModeOn$,
    depthPickerVdom$
  ).map(([url, isLoading, error, feedback, readModeOn, depthPickerVdom]) => ({ url, isLoading, error, feedback, readModeOn, depthPickerVdom }))
  return state$
}

/**
 * @param sources
 * @param sources.DOM {object} - the DOM driver
 * @param sources.parseUrlError$ {stream} - the stream of errors from the api/parse request
 * @param sources.parseUrlResponse$ {stream} - a stream of objects holding the response from the api/parse request
 * @returns {{DOM: stream, HTTP: stream, selectedUrl$: stream, selectedUrlSanitized$: stream, parseUrlLoading$: stream, isReadModeOn$: stream, depth$: stream}}
 * @constructor
 */
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
