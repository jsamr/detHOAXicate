import { div } from '@cycle/dom'
import xs from 'xstream'

function view () {
  return div('#Title', [ 'detHOAXicate', div('#Subtitle', 'the hoax decompiler') ])
}

function Title () {
  return {
    DOM: xs.of(view())
  }
}

export default Title
