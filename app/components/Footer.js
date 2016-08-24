import xs from 'xstream'
import { span, a, i } from '@cycle/dom'

function Footer (/* sources */) {
  return {
    DOM: xs.of(span('#Footer', [
      span('credits to Jules Randolph, Romain Poussier - License MIT '),
      a({ attrs: { href: 'https://github.com/sveinburne/detHOAXicate' } }, [ i('.fa .fa-github'), 'github' ])
    ]))
  }
}

export default Footer
