import { input, div, span, i } from '@cycle/dom'
import { isValidURL } from 'shared/validation'
import xs from 'xstream'

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

function intent ({ DOM, inputValue, ...sources }) {
  return {
    isReadModeOn$: DOM.select('#ReadModeToggle').events('click').fold((acc, next) => !acc, true),
    selectedUrl$: inputValue.filter(isValidURL).startWith(null),
    inputValue,
    ...sources
  }
}

function model (sources) {
  const { inputValue, parseUrlLoading$, parseUrlError$, isReadModeOn$ } = sources
  const feedbackDom$ = xs.merge(inputValue.mapTo(null), parseUrlError$.map(renderErrorIcon))
  const state$ = xs.combine(
    inputValue,
    parseUrlLoading$,
    parseUrlError$.startWith(null),
    feedbackDom$,
    isReadModeOn$
  ).map(([url, isLoading, error, feedback, readModeOn]) => ({ url, isLoading, error, feedback, readModeOn }))
  return state$
}

function renderHeader ({ url, isLoading, error, feedback, readModeOn }) {
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

function view (state$) {
  return state$.map(renderHeader)
}

function Header (sources) {
  const expandedSources = intent(sources)
  const state$ = model(expandedSources)
  const vdom$ = view(state$)
  return {
    DOM: vdom$,
    selectedUrl: expandedSources.selectedUrl$,
    isReadModeOn$: expandedSources.isReadModeOn$
  }
}

export default Header
