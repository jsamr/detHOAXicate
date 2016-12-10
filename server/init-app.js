import path from 'path'
import express from 'express'
import webpack from 'webpack'
import webpackMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import getAppConfig from '../webpack.config'
import articleConfig from '../webpack.article.config'
import { argv } from 'yargs'
import initRoutes from './init-routes'
import initSecurity from './init-security'

const isDeveloping = process.env.NODE_ENV !== 'production'
const app = express()

function getApplicationRoot () {
  let approot = 'Root'
  if (argv.component || argv.c) {
    approot = argv.component || argv.c
  }
  return approot
}

function useConfig (config) {
  const compiler = webpack(config)
  const middleware = webpackMiddleware(compiler, {
    publicPath: config.output.publicPath,
    contentBase: 'src',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false
    }
  })
  app.use(middleware)
  app.use(webpackHotMiddleware(compiler))
}

if (isDeveloping) {
  const middleware = useConfig(getAppConfig(getApplicationRoot()))
  useConfig(articleConfig)
  app.get('/', function response (req, res) {
    res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/index.html')))
    res.end()
  })
} else {
  app.use(express.static(path.join(__dirname, '/dist')))
  app.get('/', function response (req, res) {
    res.sendFile(path.join(__dirname, 'dist/index.html'))
  })
}

initRoutes(app)
initSecurity(app)

export default app
