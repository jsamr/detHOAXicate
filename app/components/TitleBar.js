import { div, i, a } from '@cycle/dom'
import xs from 'xstream'
import { makeToggleButton } from '../dom-utils'

const toggleSourcesPanelViewButton = makeToggleButton(
  '#SourceTreeToggle',
  { label: 'CLOSES SOURCES PANEL', icon: '.fa.fa-pagelines.ico-opposite' },
  { label: 'OPEN SOURCES PANEL', icon: '.fa.fa-pagelines' }
)

function renderTitleBar ({ ans, isSourcesPanelOpen }) {
  const { metaInfo, url } = ans || {}
  const { title } = metaInfo || {}
  return div('#TitleBar',  { attrs: { class: metaInfo ? 'expanded' : 'collapsed' } }, [
    div('.title', [
      title || '?[Title not found]',
      a('#OpenLinkNewTab', { attrs: { class: 'link', href: url, target: '_blank' } }, [ i('.fa.fa-external-link') ])
    ]),
    div('.actions', [
      toggleSourcesPanelViewButton(isSourcesPanelOpen)
    ])
  ])
}

function intent ({ DOM, ...sources }) {
  return  {
    isPanelOpen$: DOM.select('#SourceTreeToggle').events('click').fold((acc) => !acc, false),
    ...sources
  }
}

function model (sources) {
  const { isPanelOpen$, parseUrlResponse$ } = sources
  const metaInfoStream$ = parseUrlResponse$.filter((ans) => ans.parseSuccess).startWith(null)
  return xs.combine(
    metaInfoStream$,
    isPanelOpen$
  ).map(([ ans, isSourcesPanelOpen ]) => ({ ans, isSourcesPanelOpen }))
}

function view (state$) {
  return state$.map(renderTitleBar)
}

function TitleBar (sources) {
  const expandedSources = intent(sources)
  const state$ = model(expandedSources)
  const vdom$ = view(state$)
  return {
    DOM: vdom$,
    isPanelOpen$: expandedSources.isPanelOpen$
  }
}

export default TitleBar
