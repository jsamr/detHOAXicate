import identity from 'lodash/identity'
import { div, i, a } from '@cycle/dom'
import xs from 'xstream'

function toggleSourcesPanelViewButton ([ canShow, isOpen ]) {
  return div('.flex-inline-centered', [
    div('#SourceTreeToggle', { attrs: { class: 'button' } },
      isOpen ? [ i('.fa.fa-pagelines.ico-opposite'), 'CLOSES SOURCES PANEL' ] : [ i('.fa.fa-pagelines'), 'OPEN SOURCES PANEL' ]
    )
  ])
}

function titleBar ([ ans, sourcesPanelButton ]) {
  const { metaInfo, url } = ans || {}
  const { title } = metaInfo || {}
  return div('#TitleBar',  { attrs: { class: metaInfo ? 'expanded' : 'collapsed' } }, [
    div('.title', [ title || '?[Title not found]' ]),
    div('.actions', [
      sourcesPanelButton,
      a('#OpenLinkNewTab', { attrs: { class: 'button', href: url, target: '_blank' } }, [
        i('.fa.fa-link'),
        'OPEN LINK IN NEW TAB'
      ])
    ])
  ])
}

function TitleBar (sources) {
  const { parseUrlResponse, canShowDiagram, DOM } = sources
  const isPanelOpen$ = DOM.select('#SourceTreeToggle').events('click').fold((acc) => !acc, false)
  const sourcesPanelButton$ = xs.combine(canShowDiagram.startWith(false), isPanelOpen$.startWith(false)).map(toggleSourcesPanelViewButton).filter(identity).startWith(null)
  const metaInfoStream$ = parseUrlResponse.filter((ans) => ans.parseSuccess).startWith(null)
  const vdom$ = xs.combine(metaInfoStream$, sourcesPanelButton$).map(titleBar)
  return {
    DOM: vdom$,
    isPanelOpen: isPanelOpen$
  }
}

export default TitleBar
