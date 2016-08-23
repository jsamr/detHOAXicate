import { makeDOMDriver } from '@cycle/dom'
import { makeHTTPDriver } from '@cycle/http'
import Cycle from '@cycle/xstream-run'

import './style/main.scss'
import 'font-awesome/scss/font-awesome.scss'

import Root from './components/Root'

/**
 * A stream from xstream library
 * @typedef {Array} stream
 */

Cycle.run(Root, {
  DOM: makeDOMDriver('#app'),
  HTTP: makeHTTPDriver()
})
