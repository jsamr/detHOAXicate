import isUrl from 'validator/lib/isURL'
import { parseUrl } from '../parser'
import Promise from 'bluebird'

/**
 * Parse the dom of the given url and build an index of all classes names
 * @param {string} url - The url to parse
 * @param {number} depth - The depth of the tree
 * @returns {Promise} - A promise which resolves to an object with two fields :
 * {number} internalCount, the number of internal links (sharing url domain)
 * {Array<string>} externals, the urls to external resources
 */
function parse (url, depth) {
  const value = new Promise((resolve, reject) => {
    console.info('RECEIVED PARSE URL REQUEST WITH URL ', url, ' AND DEPTH ', depth)
    if (typeof url === 'string' && isUrl(url)) {
      resolve(parseUrl(url, depth))
    } else {
      reject(new TypeError('Could not process request, url is not of expected format'))
    }
  })
  return value
}

export default parse
