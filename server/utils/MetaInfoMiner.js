import R from 'ramda'
import { queryAll } from './dom-utils'
import isUrl from 'validator/lib/isURL'
import isIso8601 from 'validator/lib/isISO8601'

function composeStringValidator (validator) {
  return (string) => typeof string === 'string' && validator(string)
}

const HTML_TAG_KEY_MAP = {
  lang: {
    meta: 'locale',
    weight: 1
  }
}

const STANDARD_DOM_KEY_MAP = {
  description: {
    meta: 'description',
    weight: 0
  },
  title: {
    meta: 'title',
    weight: 0
  },
  author: {
    meta: 'authors',
    weight: 0
  },
  publisher: {
    meta: 'provider',
    weight: 0
  }
}
const STANDARD_DOM_TARGET_NAMES = Object.keys(STANDARD_DOM_KEY_MAP)

const OPEN_GRAPH_KEY_MAP = {
  'og:site_name': {
    meta: 'provider',
    weight: 1
  },
  'og:type': {
    meta: 'ogType',
    weight: 0
  },
  'og:title': {
    meta: 'title',
    weight: 2
  },
  'og:locale': {
    meta: 'locale',
    // sanitize to comply with RFC 5646
    sanitize: (locale) => locale.replace('_', '-'),
    weight: 0
  },
  'og:image': {
    meta: 'image',
    weight: 1
  },
  'og:description': {
    meta: 'description',
    weight: 1
  },
  'article:author': {
    meta: 'authors',
    weight: 2
  },
  'article:section': {
    meta: 'section',
    weight: 1
  },
  'article:modified_time': {
    meta: 'modifiedTime',
    weight: 2
  },
  'article:published_time': {
    meta: 'publishedTime',
    weight: 2
  },
  'article:tag': {
    meta: 'tags',
    weight: 2
  }
}
const OPEN_GRAPH_TARGET_NAMES = Object.keys(OPEN_GRAPH_KEY_MAP)

const SCHEMA_ORG_KEY_MAP = {
  articleSection: {
    meta: 'section',
    weight: 0
  },
  dateModified: {
    meta: 'modifiedTime',
    weight: 1
  },
  datePublished: {
    meta: 'publishedTime',
    weight: 1
  },
  genre: {
    meta: 'genre',
    weight: 0
  },
  inLanguage: {
    meta: 'locale',
    weight: 3
  },
  contentLocation: {
    meta: 'location',
    weight: 1
  },
  name: {
    meta: 'title',
    weight: 1
  },
  headline: {
    meta: 'title',
    weight: 0
  },
  description: {
    meta: 'description',
    weight: 1
  }
}
const SCHEMA_ORG_TARGET_NAMES = Object.keys(SCHEMA_ORG_KEY_MAP)

const META_FIELDS_DESCRIPTORS = {
  title: {},
  description: {},
  authors: {
    array: true
  },
  provider: {},
  genre: {},
  image: {
    validate: composeStringValidator(isUrl)
  },
  ogType: {},
  section: {},
  publishedTime: {
    validate: composeStringValidator(isIso8601)
  },
  modifiedTime: {
    validate: composeStringValidator(isIso8601)
  },
  locale: {
    validate: (loc) => /[a]-[a]]/.test(loc)
  },
  location: {},
  tags: {
    array: true
  }
}

const META_FIELDS_NAMES = Object.keys(META_FIELDS_DESCRIPTORS)

function accumulateElValue (container, el, getDescriptor, getValue) {
  const descriptor = getDescriptor(el)
  const sanitize = descriptor.sanitize
  const accessor = descriptor.meta
  const weight = descriptor.weight || 0
  const validator = META_FIELDS_DESCRIPTORS[accessor].validate
  const isArray = META_FIELDS_DESCRIPTORS[accessor].array
  let value = getValue(el)
  if (isArray && !R.isArrayLike(value)) value = [value]
  if (sanitize) value = sanitize(value)
  if (!(validator && !validator(value))) {
    container[accessor].push({ value, weight })
  }
  return container
}

function elAttributeContentReducer (attribute, map) {
  const getDescriptor = (el) => map[el.getAttribute(attribute)]
  const getValue = (el) => el.getAttribute('content') || el.getAttribute('value')
  return R.partialRight(accumulateElValue, [ getDescriptor, getValue ])
}

class MetaInfoMiner {
  constructor (window, targetUrl) {
    this.body = window.document.body
    this.document = window.document
    this.head = window.document.head
    this.targetUrl = targetUrl
  }

  searchStandardHead (container) {
    const valuableMetaTags = R.filter((el) => R.contains(el.getAttribute('name'), STANDARD_DOM_TARGET_NAMES), queryAll(this.head, 'meta[name]'))
    R.reduce(elAttributeContentReducer('name', STANDARD_DOM_KEY_MAP), container, valuableMetaTags)
    accumulateElValue(container, this.document.children[0], () => HTML_TAG_KEY_MAP.lang, (el) => el.getAttribute('lang'))
  }

  searchOpenGraphHead (container) {
    const valuableMetaTags = R.filter((el) => R.contains(el.getAttribute('property'), OPEN_GRAPH_TARGET_NAMES), queryAll(this.head, 'meta[property]'))
    R.reduce(elAttributeContentReducer('property', OPEN_GRAPH_KEY_MAP), container, valuableMetaTags)
  }

  searchSchemaOrghHead (container) {
    const valuableMetaTags = R.filter((el) => R.contains(el.getAttribute('itemprop'), SCHEMA_ORG_TARGET_NAMES), queryAll(this.head, 'meta[itemprop]'))
    R.reduce(elAttributeContentReducer('itemprop', SCHEMA_ORG_KEY_MAP), container, valuableMetaTags)
  }

  buildContainer () {
    return R.reduce((acc, name) => {
      acc[name] = []
      return acc
    }, {}, META_FIELDS_NAMES)
  }

  pruneContainer (container) {
    return R.map((field) => {
      const candidateValue = R.last(R.sortBy(R.prop('weight'), field))
      return candidateValue && candidateValue.value
    }, container)
  }
  /**
   * @returns {{
   *  title: string,
   *  description: string,
   *  authors: [string],
   *  provider: string,
   *  genre: string,
   *  image: string,
   *  ogType: string,
   *  section: string,
   *  publishedTime: string,
   *  modifiedTime: string,
   *  locale: string,
   *  location: string,
   *  tags: [string]
   *  }}
   */
  parse () {
    const now = new Date()
    const container = this.buildContainer()
    this.searchStandardHead(container)
    this.searchOpenGraphHead(container)
    this.searchSchemaOrghHead(container)
    const meta = this.pruneContainer(container)
    console.info('took', new Date() - now, 'ms to parse metainfo for url', this.targetUrl)
    return meta
  }
}

export default MetaInfoMiner
