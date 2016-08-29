import { div, span, i } from '@cycle/dom'

function makeButton ({ selector, desc }) {
  return div(selector, { attrs: { class: 'button' } }, makeInnerButton(desc))
}

function makeInnerButton ({ label, icon }) {
  return [ i(icon), label ? span('.button-text', label) : null ]
}

function makeToggleButton (selector, ifTrue, ifFalse) {
  return (isOpen) => div(selector, { attrs: { class: 'button' } },
    isOpen ? makeInnerButton(ifTrue) : makeInnerButton(ifFalse)
  )
}

function targetValue (event) {
  return event.target.value
}

export {
  targetValue,
  makeButton,
  makeToggleButton
}
