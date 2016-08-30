import { input, div, span, i } from '@cycle/dom'
import isolate from '@cycle/isolate'
import xs from 'xstream'
import isInteger from 'lodash/isInteger'
import defaults from 'lodash/defaults'
import { accumulate } from 'shared/stream-utils'

const defaultOptions = {
  min: -Infinity,
  max: +Infinity,
  label: ''
}

function view ({ value, legend, min, max }) {
  return div('.NumberPicker', [
    i('#Decrementer', { attrs: { class: `fa fa-minus modifier ${value <= min ? 'is-disabled' : ''}` } }),
    input('#NumberInput', { attrs: { type: 'text', value }, hook: {
      update: (vdom) => {
        vdom.elm.value = value
      }
    }}),
    i('#Incrementer', { attrs: { class: `fa fa-plus modifier ${value >= max ? 'is-disabled' : ''}` } }),
    span('.legend', legend)
  ])
}

function intent (DOM) {
  const increment$ = DOM.select('#Incrementer').events('click')
  const decrement$ = DOM.select('#Decrementer').events('click')
  const input$ = DOM.select('#NumberInput').events('input').map((e) => parseInt(e.target.value))
  return {
    increment$,
    decrement$,
    input$
  }
}

function sanitize (options) {
  const { min, max } = options
  return (targetStream$) => targetStream$.fold((acc, last) => {
    if (!isInteger(last) || last > max || last < min) return acc
    else return last
  }, null)
}

function transform (sources, options) {
  const { increment$, decrement$, input$ } = sources
  const { min, max } = options
  const actions$ = xs.merge(
    increment$.mapTo(+1),
    decrement$.mapTo(-1),
  )
  const value$ = input$.startWith(2).map((val) => actions$.compose(accumulate(val, min, max))).flatten()
  const sanitizedValue$ = value$.compose(sanitize(options))
  return {
    number$: sanitizedValue$,
    ...sources
  }
}

function model (sources, options) {
  const { number$ } = sources
  return number$.map((value) => ({ value, ...options }))
}

function NumberPicker (sources, options) {
  const usedOptions = defaults(options, defaultOptions)
  const intents = intent(sources.DOM)
  const transformedSources = transform({ ...sources, ...intents }, usedOptions)
  const state$ = model(transformedSources, usedOptions)
  const vdom$ = state$.map(view)
  return {
    DOM: vdom$,
    number$: transformedSources.number$
  }
}

/**
 * @param {string} scope - the scope to isolate this component
 * @param sources
 * @param sources.DOM {object} - The DOM driver
 * @param [options]
 * @param [options.min=-Infinity] {number}  - An integer that sets the min value
 * @param [options.max=+Infinity] {number} - An integer that sets the max value
 * @param [options.label=''] {string} - An integer that sets the name of the picker
 * @returns {{DOM: stream, number$: stream}}
 * @constructor
 */
export default (sources, scope, options) => isolate(NumberPicker, scope)(sources, options)
