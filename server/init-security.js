// For later use
// import cors from 'cors'

function setContentPolicy (req, res, next) {
  res.setHeader('Content-Security-Policy', "script-src 'self'")
  next()
}

export default function (app) {
  app.use(setContentPolicy)
}
