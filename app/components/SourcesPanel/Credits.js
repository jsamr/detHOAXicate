import xs from 'xstream'
import { span, a, i } from '@cycle/dom'

function renderCredits () {
  return span('#Credits', [
    span('credits to Jules Randolph, Romain Poussier - License MIT '),
    a({ attrs: { href: 'https://github.com/sveinburne/detHOAXicate', target: '_blank' } }, [ i('.fa .fa-github'), 'github' ])
  ])
}

function view () {
  return xs.of(renderCredits())
}

function Credits (/* sources */) {
  return {
    DOM: view()
  }
}

export default Credits
