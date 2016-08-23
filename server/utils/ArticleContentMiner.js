import R from 'ramda'

import Readability from './ReadabilityCustom'
import { queryAll } from './dom-utils'

const ARTICLE_QUERIES = ['article', '[class*=article]', '[class*=story]', '[id*=article]', '[itemtype]', '[property=articleBody]']
const ARTICLE_JOINED_QUERIES = ARTICLE_QUERIES.join(',')

const weightModifiers = [
  {
    matcher: /(article|story)[\S]*body/g,
    weight: 3
  },
  {
    matcher: /(article|story)[\S]*content/g,
    weight: 4
  },
  {
    matcher: /(article|story)[\S]*comment/g,
    weight: -10
  }
]

function compareWeights (o1, o2) {
  return o1.weight > o2.weight
}

function computeNodeWeights (collection) {
  return function (node) {
    const weight = R.reduce((stack, parentCandidate) => {
      if (isParent(parentCandidate, node)) return stack + computeNodeValue(node)
      else return stack
    }, 0, collection)
    return {
      node,
      weight}
  }
}

function isParent (parentCandidate, childCandidate) {
  let iteratee = childCandidate
  while ((iteratee = iteratee.parentElement) != null) {
    if (iteratee === parentCandidate) return true
  }
  return false
}

function computeNodeValue (node) {
  const valueChain = (node.className || '') + (node.id || '')
  let weightAcc = 1
  const itemtype = node.getAttribute('itemtype')
  const property = node.getAttribute('property')
  if (itemtype) {
    if (itemtype === 'http://schema.org/Article') return 100
    else return -100
  }
  if (property) {
    if (property === 'articleBody') return 100
    else return -100
  }
  weightModifiers.forEach((mod) => {
    if (mod.matcher.test(valueChain)) weightAcc += mod.weight
  })

  return weightAcc
}

class ArticleContentMiner {
  constructor (window, targetUrl) {
    this.readability = new Readability(targetUrl, window.document)
    this.body = window.document.body
    this.document = window.document
    this.targetUrl = targetUrl
  }

  findSourcesWithCustomMiner () {
    const now = new Date()
    let matches = R.uniq(queryAll(this.body, ARTICLE_JOINED_QUERIES))
    // For each candidate, we give a weight that is as big as it has :
    // - multiple parents that have been matched
    // - classes or id that match 'article.*(body|content)' are given extra weight
    // - if weights are equal, take the one who has the biggest number of <p> children.
    const match = R.head(R.sort(R.comparator(compareWeights), matches.map(computeNodeWeights(matches), matches)))
    console.info('took ', new Date() - now, ' ms to parse ', this.targetUrl, ' with custom article miner')
    return match && match.node
  }

  parse () {
    const now = new Date()
    const articleNode = this.readability.findArticleNode() || {}
    console.info('took ', new Date() - now, ' ms to parse ', this.targetUrl, ' with readability based article miner')
    if (articleNode) {
      return articleNode
    } else {
      return this.findSourcesWithCustomMiner()
    }
  }
}

export default ArticleContentMiner
