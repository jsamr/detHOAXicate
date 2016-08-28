import { div, span, i } from '@cycle/dom'
import xs from 'xstream'

function view () {
  return xs.of(div('#SourcesPanel_header', { attrs: { class: 'flex-inline-centered' } }, [
    span('#SourcesPanelToggle', { attrs: { class: 'title' } }, [ i('.fa.fa-pagelines') ])
  ]))
}

function Header () {
  const vdom$ = view()
  return {
    DOM: vdom$
  }
}

export default Header
