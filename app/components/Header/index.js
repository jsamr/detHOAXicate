import { div, span, i } from '@cycle/dom'
import xs from 'xstream'

import Parse from 'app/api/Parse'
import NumberPicker from '../../generics/NumberPicker'
import LoadingIcon from '../../generics/LoadingIcon'
import Title from './Title'
import UrlSearch from './UrlSearch'

function renderErrorIcon () {
  return div('.flex-column-centered', [
    i('.fa.fa-warning.error'),
    span('.font-small', 'detHOAXicate could not parse this link. Please try an other link')
  ])
}

function transform (sources) {
  const { parseUrlError$, parseUrlResponse$, DOM } = sources
  const urlSearch = UrlSearch({ DOM })
  const { selectedUrlSanitized$, selectedUrl$, isReadModeOn$ } = urlSearch
  const depthPicker = NumberPicker({ DOM }, 'DepthPicker', { legend: 'depth', min: 0, max: 6 })
  const depth$ = depthPicker.number$
  const parseUrlReq$ = Parse({ url$: selectedUrlSanitized$, depth$ }).HTTP
  const parseUrlLoading$ = xs.merge(
    parseUrlReq$.mapTo(true),
    parseUrlError$.mapTo(false),
    parseUrlResponse$.mapTo(false)
  ).startWith(false)
  // vdoms$
  const titleVdom$ = Title().DOM
  const depthPickerVdom$ = depthPicker.DOM
  const urlSearchVdom$ = urlSearch.DOM
  const loadingIconVdom$ = LoadingIcon({ isLoading$: parseUrlLoading$ }).DOM
  return {
    depth$,
    parseUrlLoading$,
    parseUrlReq$,
    isReadModeOn$,
    selectedUrlSanitized$,
    selectedUrl$,
    titleVdom$,
    urlSearchVdom$,
    depthPickerVdom$,
    loadingIconVdom$,
    ...sources
  }
}

function view ({ titleVdom, urlSearchVdom, depthPickerVdom, loadingIconVdom }) {
  return div('#Header', [
    titleVdom,
    urlSearchVdom,
    depthPickerVdom,
    loadingIconVdom
  ])
}

function model (sources) {
  const { titleVdom$, urlSearchVdom$, depthPickerVdom$, loadingIconVdom$ } = sources
  const state$ = xs.combine(
    titleVdom$,
    urlSearchVdom$,
    depthPickerVdom$,
    loadingIconVdom$
  ).map(([titleVdom, urlSearchVdom, depthPickerVdom, loadingIconVdom]) => ({ titleVdom, urlSearchVdom, depthPickerVdom, loadingIconVdom }))
  return state$
}

/**
 * @param sources
 * @param sources.DOM {object} - the DOM driver
 * @param sources.parseUrlError$ {stream} - the stream of errors from the api/parse request
 * @param sources.parseUrlResponse$ {stream} - a stream of objects holding the response from the api/parse request
 * @returns {{DOM: stream, HTTP: stream, selectedUrl$: stream, selectedUrlSanitized$: stream, parseUrlLoading$: stream, isReadModeOn$: stream}}
 */
function Header (sources) {
  const transformedSources = transform(sources)
  const state$ = model(transformedSources)
  const vdom$ = state$.map(view)
  return {
    DOM: vdom$,
    HTTP: transformedSources.parseUrlReq$,
    selectedUrl$: transformedSources.selectedUrl$,
    selectedUrlSanitized$: transformedSources.selectedUrlSanitized$,
    parseUrlLoading$: transformedSources.parseUrlLoading$,
    isReadModeOn$: transformedSources.isReadModeOn$
  }
}

export default Header
