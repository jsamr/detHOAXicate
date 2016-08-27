import { div, span } from '@cycle/dom'
import xs from 'xstream'

function view () {
  return xs.of(div('#SourcesPanel_header', { attrs: { class: 'flex-inline-centered' } }, [
    span('.title', '{ Sources Panel }')
  ]))
}

function Header () {
  const vdom$ = view()
  return {
    DOM: vdom$
  }
}

export default Header
