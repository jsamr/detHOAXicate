import { div, span, i } from '@cycle/dom'
import xs from 'xstream'
import { toggle } from 'shared/stream-utils'

function intent (DOM) {
  const isPanelOpen$ = xs.merge(
      DOM.select('#SourcesPanelToggle').events('click'),
      DOM.select('#SourcesPanelIcon').events('click')
  ).compose(toggle(false))
  return {
    isPanelOpen$: isPanelOpen$
  }
}

function toggleSourcesPanelViewButton (isOpen) {
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

/**
 * A Component holding the basic user inputs
 * @param sources
 * @param sources.DOM - the DOM driver
 * @returns {{DOM: stream, isPanelOpen$: stream}}
 */
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
