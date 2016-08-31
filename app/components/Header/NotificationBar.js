import { div, i, em } from '@cycle/dom'

function view (error) {
  return div('#NotificationBar', { class: { 'is-extended': !!error, 'is-collapsed': !error } }, [
    div('.NotificationBar_icon', [i('.fa.fa-warning.error'), 'detHOAXicate could not parse this link. Please try an other link']),
    div('.NotificationBar_message', [ em([error && error.message]) ])
  ])
}

function model (sources) {
  return sources.errorFlow$.startWith(null)
}

/**
 * @param sources
 * @param {stream} sources.errorFlow$ - a stream of error descriptors with a message field. null events make the bar collapse.
 * @returns {{DOM: stream}}
 */
function NotificationBar (sources) {
  const state$ = model(sources)
  const vdom$ = state$.map(view)
  return {
    DOM: vdom$
  }
}

export default NotificationBar
