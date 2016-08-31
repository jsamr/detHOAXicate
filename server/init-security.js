// For later use
// import cors from 'cors'

function setContentPolicy (req, res, next) {
  // prevent external scripts
  res.setHeader('Content-Security-Policy', "script-src 'self'")
  // prevent this app to be embedded in an external iFrame
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  next()
}

export default function (app) {
  app.use(setContentPolicy)
}
