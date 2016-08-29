import { div, span, i } from '@cycle/dom'
import xs from 'xstream'

function intent (DOM) {
  const isPanelOpen$ = xs.merge(
      DOM.select('#SourcesPanelToggle').events('click'),
      DOM.select('#SourcesPanelIcon').events('click')
  ).fold((acc) => !acc, false)
  return {
    isPanelOpen$: isPanelOpen$
  }
}

function toggleSourcesPanelViewButton (isOpen) {
  console.info('RECEIVED', isOpen)
  return div('#SourcesPanelToggle',
    isOpen ? [
      i('.fa.fa-chevron-down'),
      span('.label', 'CLOSE SOURCES PANEL')
    ] : [
      i('.fa.fa-chevron-up'),
      span('.label', 'OPEN SOURCES PANEL')
    ]
  )
}

function view (isOpen) {
  return div('#SourcesPanel_header', { attrs: { class: 'flex-inline-centered' } }, [
    span('#SourcesPanelIcon', { attrs: { class: 'title' } }, [ i('.fa.fa-pagelines') ]),
    toggleSourcesPanelViewButton(isOpen)
  ])
}

function model (sources) {
  return sources.isPanelOpen$
}

function Header (sources) {
  const intents = intent(sources.DOM)
  const state$ = model(intents)
  const vdom$ = state$.map(view)
  return {
    DOM: vdom$,
    isPanelOpen$: intents.isPanelOpen$
  }
}

export default Header
