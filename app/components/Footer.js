import xs from 'xstream'
import { div } from '@cycle/dom'

function Footer (/* sources */) {
  return {
    DOM: xs.of(div('#Footer', 'detHOAXicate, the HOAX decompiler - credits Jules Randolph, Romain Poussier'))
  }
}

export default Footer
