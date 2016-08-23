import parseRoute from './api/parse-route'
import bodyParser from 'body-parser'
import app from './init-app'

app.use(bodyParser.json())

app.post('/api/parse', function (req, res) {
  if (req.is('application/json')) {
    parseRoute(req.body.url, req.body.depth)
      .then((links) => {
        res.setHeader('Content-Type', 'application/json')
        res.send(JSON.stringify(links))
      })
      .catch((err) => {
        console.error(err)
        res.status(500).send(`Server error: ${err.message}`)
      })
  } else {
    res.status(406).send()
  }
})

export default app
