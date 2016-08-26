import parseRoute from './api/parse-route'
import bodyParser from 'body-parser'
import express from 'express'

export default function (app) {
  app.use(bodyParser.json())
  app.use('/static', express.static('public'))
  app.post('/api/parse', parseRoute)
}

