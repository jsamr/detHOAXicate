import { div, pre, span } from '@cycle/dom'
import xs from 'xstream'

function SourcesPanel ({ parseUrlResponse, parseUrlLoading, parseUrlError, openPanel }) {
  const articleRepVdom$ = xs.combine(
    parseUrlResponse.startWith(null),
    parseUrlLoading,
    openPanel
  ).map(([articleRep, isLoading, isPanelOpen]) => {
    const canShowContent = !isLoading && articleRep
    return div('#SourcesPanel', {
      attrs: {
        'data-ui-state': `${canShowContent ? (isPanelOpen ? '' : 'small') : 'collapsed'}`
      }
    }, [
      div('#SourcesPanel_header.flex-inline-centered ', [
        span('.padded', 'Sources Panel')
      ]),
      isPanelOpen ? pre('', JSON.stringify(articleRep, null, 2)) : null
    ])
  })
  // merge errors mapped to null so that the previous diagram does not display upon error
  const vdom$ = xs.merge(articleRepVdom$, parseUrlError.map((e) => null)).startWith(null)
  return {
    DOM: vdom$
  }
}

export default SourcesPanel
