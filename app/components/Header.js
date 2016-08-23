import { input, div, span } from '@cycle/dom'
import { targetValue } from '../dom-utils'
import { isValidURL } from '../validation'

function makeUrlFeedback (url) {
  if (url) return isValidURL(url) ? span('.success', 'This is a valid URL') : span('.error', 'This is not a valid URL!')
  else return span('.info', 'Please provide a URL')
}

function Header ({ DOM, selectedUrl }) {
  let inputValue$ = DOM.select('#UrlInput').events('input').map(targetValue).startWith(selectedUrl)
  const vdom$ = inputValue$.map(url => div('#Header', [
    input('#UrlInput', { attrs: { type: 'text', value: url } }),
    div('#UrlFeedback', [ makeUrlFeedback(url) ])
  ]))
  return {
    DOM: vdom$,
    value: inputValue$.filter(isValidURL).startWith(null).remember()
  }
}

export default Header
