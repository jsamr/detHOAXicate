import { div } from '@cycle/dom'
import xs from 'xstream'

function view () {
  return xs.of(div('#Fallback', [
    div('Welcome to detHOAXicate!'),
    div('Paste a link to start detoxicating information')
  ]))
}

/**
 * @returns {{DOM: stream}}
 */
function Fallback () {
  const vdom$ = view()
  return {
    DOM: vdom$
  }
}

export default Fallback
