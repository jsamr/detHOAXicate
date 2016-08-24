import { input, div, span, i } from '@cycle/dom'
import { isValidURL } from '../validation'
import xs from 'xstream'
import identity from 'lodash/identity'

function makeUrlFeedback (url) {
  if (url) return isValidURL(url) ? i('.success .fa .fa-check') : i('.error .fa .fa-warning')
  else return i('.info .fa .fa-search')
}

function feedbackLoadingIcon () {
  return i('.fa .fa-spinner .fa-spin')
}

function feedbackErrorIcon () {
  return div('.flex-column-centered', [
    i('.fa .fa-warning .error'),
    span('.small-font', 'detHOAXicate could not parse this link. Please try an other link')
  ])
}

function toggleSourcesPanelViewButton (isOpen) {
  console.info('IS_OPEN', isOpen)
  return div('#SourceTreeToggle', { attrs: { class: '.flex-inline-centered' } }, [
    isOpen ? div('.button', [ i('.fa.fa-pagelines'), 'HIDE SOURCES TREE' ]) : div('.button', [ i('.fa.fa-pagelines'), 'DISPLAY SOURCES TREE' ])
  ])
}

function Header ({ DOM, inputValue, parseUrlLoading, parseUrlError, canShowDiagram }) {
  const isSelected$ = DOM.select('#SourceTreeToggle').events('click').fold((acc, next) => !acc, false).startWith(false)
  const parseUrlErrorMem = parseUrlError.startWith(null)
  const sourceTreeButton = xs.combine(canShowDiagram, isSelected$).map(([canShow, isSelected$]) => canShow ? toggleSourcesPanelViewButton(isSelected$) : null).filter(identity)
  const feedbackDom = xs.merge(inputValue.mapTo(null), sourceTreeButton, parseUrlError.map(feedbackErrorIcon))
  const vdom$ = xs.combine(inputValue, parseUrlLoading, parseUrlErrorMem, feedbackDom).map(([url, isLoading, error, feedback]) => {
    return div('#Header', [
      div('#Title', [ 'detHOAXicate', div('#Subtitle', 'the hoax decompiler') ]),
      div('#UrlSearch', [
        div('#UrlFeedback', [ makeUrlFeedback(url) ]),
        input('#UrlInput', { attrs: { type: 'text', value: url, autofocus: true, placeholder: 'Type a link to generate a source diagram from' } })
      ]),
      div('.feedback', [
        isLoading ? feedbackLoadingIcon() : feedback
      ])
    ])
  })
  return {
    DOM: vdom$,
    selectedUrl: inputValue.filter(isValidURL).startWith(null).remember(),
    openPanel: isSelected$
  }
}

export default Header
