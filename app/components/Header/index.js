import { input, div, span, i } from '@cycle/dom'
import { isValidURL } from '../validation'
import xs from 'xstream'

function makeUrlFeedback (url) {
  if (url) return isValidURL(url) ? i('.success .fa .fa-check') : i('.error .fa .fa-warning')
  else return i('.info.fa.fa-search')
}

function feedbackLoadingIcon () {
  return div('.flex-inline-centered', [ i('.icon-spin6 .icon-spin') ])
}

function feedbackErrorIcon () {
  return div('.flex-column-centered', [
    i('.fa.fa-warning.error'),
    span('.font-small', 'detHOAXicate could not parse this link. Please try an other link')
  ])
}

function readModeFeedbackIcon (readModeOn) {
  return div('#ReadModeToggle', { attrs: { class: `UrlSearch_feedback ${readModeOn ? '' : 'disabled'}` } }, [ i('.icon-book-open') ])
}

function intent ({ DOM, inputValue, ...sources }) {
  return {
    readModeEnabled$: DOM.select('#ReadModeToggle').events('click').fold((acc, next) => !acc, true),
    selectedUrl$: inputValue.filter(isValidURL).startWith(null),
    inputValue,
    ...sources
  }
}

function model (sources) {
  const { inputValue, parseUrlLoading, parseUrlError, readModeEnabled$ } = sources
  const parseUrlErrorMem = parseUrlError.startWith(null)
  const feedbackDom = xs.merge(inputValue.mapTo(null), parseUrlError.map(feedbackErrorIcon))
  const state$ = xs.combine(
    inputValue,
    parseUrlLoading,
    parseUrlErrorMem,
    feedbackDom,
    readModeEnabled$
  ).map(([url, isLoading, error, feedback, readModeOn]) => ({ url, isLoading, error, feedback, readModeOn }))
  return state$
}

function renderHeader ({ url, isLoading, error, feedback, readModeOn }) {
  return div('#Header', [
    div('#Title', [ 'detHOAXicate', div('#Subtitle', 'the hoax decompiler') ]),
    div('#UrlSearch', [
      div('#UrlFeedback', { attrs: { class: 'UrlSearch_feedback' } }, [ makeUrlFeedback(url) ]),
      input('#UrlInput', { attrs: { type: 'text', value: url, autofocus: true, placeholder: 'Type a link to generate a source diagram from' } }),
      readModeFeedbackIcon(readModeOn)
    ]),
    div('.feedback', [
      isLoading ? feedbackLoadingIcon() : feedback
    ])
  ])
}

function view (state$) {
  return state$.map(renderHeader)
}

function Header (sources) {
  const transformedSources = intent(sources)
  const state$ = model(transformedSources)
  const vdom$ = view(state$)
  return {
    DOM: vdom$,
    selectedUrl: transformedSources.selectedUrl$,
    readModeEnabled: transformedSources.readModeEnabled$
  }
}

export default Header
