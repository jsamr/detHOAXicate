import { div } from '@cycle/dom'
import xs from 'xstream'
import debounce from 'xstream/extra/debounce'

import Parse from 'app/api/Parse'
import NumberPicker from '../../generics/NumberPicker'
import LoadingIcon from '../../generics/LoadingIcon'
import Title from './Title'
import UrlSearch from './UrlSearch'
import NotificationBar from './NotificationBar'

const DEBOUNCE_REQUEST_MS = 500

function transform (sources) {
  const { parseUrlError$, parseUrlResponse$, DOM } = sources
  const urlSearch = UrlSearch({ DOM })
  const { selectedUrlSanitized$, selectedUrl$, isReadModeOn$ } = urlSearch
  const depthPicker = NumberPicker({ DOM }, 'DepthPicker', { legend: 'depth', min: 0, max: 6 })
  const depth$ = depthPicker.number$
  const parseUrlReq$ = Parse({ url$: selectedUrlSanitized$.compose(debounce(DEBOUNCE_REQUEST_MS)), depth$ }).HTTP
  const errorFlow$ = xs.merge(parseUrlError$, parseUrlResponse$.mapTo(null), parseUrlReq$.mapTo(null), selectedUrl$.mapTo(null))
  const notificationBarVdom$ = NotificationBar({ DOM, errorFlow$ }).DOM
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
    notificationBarVdom$,
    ...sources
  }
}

function view ({ titleVdom, urlSearchVdom, depthPickerVdom, loadingIconVdom, notificationBarVdom }) {
  return div('#Header', [
    titleVdom,
    urlSearchVdom,
    depthPickerVdom,
    loadingIconVdom,
    notificationBarVdom
  ])
}

function model (sources) {
  const { titleVdom$, urlSearchVdom$, depthPickerVdom$, loadingIconVdom$, notificationBarVdom$ } = sources
  const state$ = xs.combine(
    titleVdom$,
    urlSearchVdom$,
    depthPickerVdom$,
    loadingIconVdom$,
    notificationBarVdom$
  ).map(([titleVdom, urlSearchVdom, depthPickerVdom, loadingIconVdom, notificationBarVdom]) => ({ titleVdom, urlSearchVdom, depthPickerVdom, loadingIconVdom, notificationBarVdom }))
  return state$
}

/**
 * @param sources
 * @param sources.DOM {object} - the DOM driver
 * @param sources.parseUrlError$ {stream} - the stream of errors from the api/parse request
 * @param sources.parseUrlResponse$ {stream} - a stream of objects holding the response from the api/parse request
 * @returns {{DOM: stream, HTTP: stream, selectedUrl$: stream, parseUrlLoading$: stream, isReadModeOn$: stream}}
 */
function Header (sources) {
  const transformedSources = transform(sources)
  const state$ = model(transformedSources)
  const vdom$ = state$.map(view)
  return {
    DOM: vdom$,
    HTTP: transformedSources.parseUrlReq$,
    selectedUrl$: transformedSources.selectedUrl$,
    parseUrlLoading$: transformedSources.parseUrlLoading$,
    isReadModeOn$: transformedSources.isReadModeOn$
  }
}

export default Header
