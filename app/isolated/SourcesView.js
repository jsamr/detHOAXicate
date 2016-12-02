import xs from 'xstream'
import SourcesView from '../components/SourcesPanel/SourcesView'
import resp1 from './resp-1.json'
import { div } from '@cycle/dom'

function transform (sources) {
  const articleRep$ = xs.of(resp1)
  return { articleRep$, ...sources }
}

function view (sv) {
  return div('#Root', [div('#SourcesPanel', { attrs: { class: 'is-expanded' } }, [ div('#SourcesView_container', [sv]) ])])
}

function SV (sources) {
  const transformedSources = transform(sources)
  const vdom$ = SourcesView(transformedSources).DOM.map(view)
  return {
    DOM: vdom$
  }
}

export default SV
