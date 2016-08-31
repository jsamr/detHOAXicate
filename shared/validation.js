import isURL from 'validator/lib/isURL'

const valideUrlOptions = {
  require_protocol: true,
  allow_underscores: true
}

function isValidURL (url) {
  return typeof url === 'string' && isURL(url, valideUrlOptions)
}

export {
  isValidURL
}
