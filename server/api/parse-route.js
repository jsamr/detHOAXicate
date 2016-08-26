import isUrl from 'validator/lib/isURL'
import { parseUrl } from '../parser'

// Could use https://github.com/ctavan/express-validator
function parseRoute (req, res) {
  if (req.is('application/json')) {
    const { url, depth } = req.body
    if (typeof url === 'string' && isUrl(url)) {
      if (typeof depth === 'number' || depth == null) {
        parseUrl(url, depth)
          .then((links) => {
            res.setHeader('Content-Type', 'application/json')
            res.send(JSON.stringify(links))
          })
          .catch((err) => {
            console.error(err)
            res.status(500).send(`Server error: ${err.message}`)
          })
      } else res.status(422).send('Wrong DEPTH parameter. Must be an integer.')
    } else {
      res.status(422).send('Wrong URL format.')
    }
  } else {
    res.status(406).send()
  }
}

export default parseRoute
