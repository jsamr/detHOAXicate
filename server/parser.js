import R from 'ramda'
import isUrl from 'validator/lib/isURL'
import jsdom from 'jsdom'
import merge from 'lodash/merge'
import Promise from 'bluebird'

import MetaInfoMiner from './utils/MetaInfoMiner'
import ArticleContentMiner from './utils/ArticleContentMiner'
import { queryAll } from './utils/dom-utils'
import { belongsToDomain, isSocialMediaDomain } from './utils/url-utils'
function extractHref (tag) {
  return tag.href
}

function isNodeHrefUrl (node) {
  return typeof node.href === 'string' && isUrl(node.href)
}

function getFallbackArticleRepresentation (url, errorMessage = undefined) {
  return {
    url,
    parseSuccess: false,
    parseError: errorMessage,
    sourcesCandidates: null,
    metaInfo: {},
    standardsCompliance: {},
    socialLinks: [],
    internalArticleCandidates: []
  }
}

function getArticleRepresentation (window, targetUrl, depth, currentDepth) {
  const shouldResolveSources = currentDepth < depth
  let promise = new Promise((resolve) => {
    const metaMiner = new MetaInfoMiner(window, targetUrl)
    const articleMiner = new ArticleContentMiner(window, targetUrl)
    const metaInfo = metaMiner.parse()
    const articleNode = articleMiner.parse()
    if (articleNode) {
      const nodes = R.filter(isNodeHrefUrl, queryAll(articleNode, 'a[href]'))
      const hrefs = R.map(extractHref, nodes)
      const [internals, externals] = R.partition(belongsToDomain(targetUrl), hrefs)
      const [socialmedia, sources] = R.partition(isSocialMediaDomain, externals)
      const responseBase = {
        url: targetUrl,
        parseSuccess: true,
        metaInfo,
        sanitizedArticleHtml: currentDepth === 0 ? articleNode.innerHTML : undefined,
        standardsCompliance: {},
        socialLinks: socialmedia,
        internalArticleCandidates: R.filter((link) => !/^.*\/$/.test(link), internals)
      }
      if (shouldResolveSources) {
        const sourcesResolutionPromises = R.map(R.partialRight(parseUrl, [depth, currentDepth + 1]), sources)
        resolve(Promise.all(sourcesResolutionPromises).then((sources) => {
          return ({
            ...responseBase,
            sourcesCandidates: sources
          })
        }))
      } else {
        resolve({
          ...responseBase,
          sourcesCandidates: null
        })
      }
    } else {
      resolve(
        merge(getFallbackArticleRepresentation(
          targetUrl,
          'Could not find a dom element candidate to contain article content'
        ), { metaInfo })
      )
    }
  })
  return promise
}

function parseUrl (targetUrl, depth = 1, currentDepth = 0) {
  const now = new Date()
  const value = new Promise((resolve) => {
    jsdom.env({
      url: targetUrl,
      done: function (jsdomErr, window) {
        console.info('took', new Date() - now, 'ms to mount dom tree for url', targetUrl)
        if (jsdomErr) resolve(getFallbackArticleRepresentation(targetUrl, jsdomErr.message))
        else {
          try {
            resolve(getArticleRepresentation(window, targetUrl, depth, currentDepth))
          } catch (resolveErr) {
            resolve(getFallbackArticleRepresentation(targetUrl, resolveErr.message))
          }
        }
      }
    })
  })
  return value
}

export {
  parseUrl
}

