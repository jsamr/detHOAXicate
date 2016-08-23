import app from './init-routes'
const isDeveloping = process.env.NODE_ENV !== 'production'

/* eslint no-console: 0 */
const port = isDeveloping ? 3000 : process.env.PORT

app.listen(port, '0.0.0.0', function onStart (err) {
  if (err) {
    console.log(err)
  }
  console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port)
})
