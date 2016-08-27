import isURL from 'validator/lib/isURL'

function isValidURL (url) {
  return typeof url === 'string' && isURL(url)
}

export {
  isValidURL
}
