import { div, svg } from '@cycle/dom'
import xs from 'xstream'

function view () {
  return xs.of(div('#Fallback', {style: {width: '1000px', height: '800px'}}, [
    svg({attrs: {width: '1000', height: '500'}}, [
      svg.defs({}, [
        svg.pattern({
          attrs: {
            id: 'image2',
            patternUnits: 'userSpaceOnUse',
            height: '150',
            width: '150',
            x: 125,
            y: 25
          }
        }, [
          svg.image({
            attrs: {
              x: '0',
              y: '0',
              height: '150',
              width: '100',
              xlink: 'href="http://static.wamiz.fr/images/adoption/large/chien-croise-basset-fauve-de-bretagne-adopter-57036-2.JPG"'
            }
          }, [])
        ])
      ]),
      svg.circle({
        attrs: {
          'cx': '200',
          'cy': '75',
          'r': '75',
          'stroke': 'white',
          'stroke-width': '2',
          'fill': 'url(#image2)'
        }
      })
    ])
  ]))
}

/**
 * @returns {{DOM: stream}}
 */
function Fallback () {
  const vdom$ = view()
  return {
    DOM: vdom$
  }
}

export default Fallback
