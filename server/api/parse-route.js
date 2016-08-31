import { isValidURL } from '../../shared/validation'
import { parseUrl } from '../parser'

function sendError (res, status, message) {
  res.setHeader('Content-Type', 'text/plain')
  res.status(status).send(message)
}

// Could use https://github.com/ctavan/express-validator
function parseRoute (req, res) {
  if (req.is('application/json')) {
    const { url, depth } = req.body
    if (typeof url === 'string' && isValidURL(url)) {
      if (typeof depth === 'number' || depth == null) {
        parseUrl(url, depth)
          .then((links) => {
            res.setHeader('Content-Type', 'application/json')
            res.send(JSON.stringify(links))
          })
          .catch((err) => {
            console.error(err)
            sendError(res, 500, `Server error: ${err.message}`)
          })
      } else sendError(res, 422, 'Wrong DEPTH parameter. Must be an integer.')
    } else {
      sendError(res, 422, 'Wrong URL format.')
    }
  } else {
    sendError(res, 400, 'Bad Content-Type')
  }
}

export default parseRoute
