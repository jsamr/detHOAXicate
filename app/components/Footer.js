import xs from 'xstream'
import { span, a, i } from '@cycle/dom'

function renderFooter () {
  return span('#Footer', [
    span('credits to Jules Randolph, Romain Poussier - License MIT '),
    a({ attrs: { href: 'https://github.com/sveinburne/detHOAXicate', target: '_blank' } }, [ i('.fa .fa-github'), 'github' ])
  ])
}

function view () {
  return xs.of(renderFooter())
}

function Footer (/* sources */) {
  return {
    DOM: view()
  }
}

export default Footer
