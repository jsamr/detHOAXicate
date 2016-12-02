import { makeDOMDriver } from '@cycle/dom'
import { makeHTTPDriver } from '@cycle/http'
import Cycle from '@cycle/xstream-run'
import rootMap from './root-map'
import 'font-awesome/scss/font-awesome.scss'
import 'normalize.css/normalize.css'
import './style/main.scss'

/**
 *
 * @param componentName - The component that should start at the root of the app
 */
function main (componentName = 'Root') {
  const normalizedCompName = componentName.toLowerCase()
  let component = rootMap[normalizedCompName]
  if (!component) {
    console.error(`No component match for ${componentName}, defaulting to Root`)
    component = rootMap.Root
  } else {
    console.info(`Component ${componentName} loading...`)
  }
  Cycle.run(component, {
    DOM: makeDOMDriver('#app'),
    HTTP: makeHTTPDriver()
  })
}
main(process.env.APPLICATION_ROOT_COMP)
