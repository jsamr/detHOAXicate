import { div } from '@cycle/dom'
import { makeToggleButton } from 'app/dom-utils'
import xs from 'xstream'

import ArticleInfo from './ArticleInfo'

const toggleSourcesPanelViewButton = makeToggleButton(
  '#SourcesPanelToggle',
  { label: 'CLOSE SOURCES PANEL', icon: '.fa.fa-toggle-on' },
  { label: 'OPEN SOURCES PANEL', icon: '.fa.fa-toggle-off' }
)

const infoToggle = makeToggleButton(
  '#InfoToggle',
  { label: 'CLOSE INFO PANEL', icon: '.fa.fa-toggle-on' },
  { label: 'OPEN INFO PANEL', icon: '.fa.fa-toggle-off' }
)

function intent (DOM) {
  return {
    isPanelOpen$: DOM.select('#SourcesPanelToggle').events('click').fold((acc) => !acc, false),
    isInfoOpen$: DOM.select('#InfoToggle').events('click').fold((acc) => !acc, false)
  }
}

function view ({ articleInfoVdom, isPanelOpen, isInfoOpen, canShow }) {
  return div('#ArticleActions', {
    attrs: { class: canShow ? (isPanelOpen ? 'is-small' : 'is-expanded') : 'is-collapsed' }
  }, [
    div('.button-group', [
      toggleSourcesPanelViewButton(isPanelOpen),
      infoToggle(isInfoOpen)
    ]),
    articleInfoVdom
  ])
}

function model (sources) {
  const { DOM, parseUrlResponse$, isPanelOpen$, isInfoOpen$, canShowDiagram$ } = sources
  const articleInfoVdom$ = ArticleInfo({ DOM, parseUrlResponse$, isExpanded$: isInfoOpen$ }).DOM
  return xs.combine(
    articleInfoVdom$,
    isPanelOpen$,
    isInfoOpen$,
    canShowDiagram$
  ).map(([articleInfoVdom, isPanelOpen, isInfoOpen, canShow]) => ({ articleInfoVdom, isPanelOpen, isInfoOpen, canShow }))
}

function ArticleActions (sources) {
  const intents = intent(sources.DOM)
  const mergedSources = { ...intents, ...sources }
  const state$ = model(mergedSources)
  const vdom$ = state$.map(view)
  return {
    DOM: vdom$,
    isPanelOpen$: mergedSources.isPanelOpen$
  }
}

export default ArticleActions
