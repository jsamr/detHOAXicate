import { iframe } from '@cycle/dom'

function model (sources) {
  const { selectedUrl$ } = sources
  return selectedUrl$
}

function view (selectedUrl) {
  return iframe('#Article', {
    attrs: {
      src: selectedUrl,
      name: 'iframe',
      sandbox: undefined,
      frameBorder: '0'
    }}
  )
}

function EmbeddedExternalSite (sources) {
  const state$ = model(sources)
  const vdom$ = state$.map(view)
  return {
    DOM: vdom$
  }
}

export default EmbeddedExternalSite
