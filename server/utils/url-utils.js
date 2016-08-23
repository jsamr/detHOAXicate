import parseDomain from 'parse-domain'
import socialMediasDomains from './social-medias-domains'

function getDomain (address) {
  return parseDomain(address).domain
}

function belongsToDomain (target) {
  const domain = getDomain(target)
  return function (ref) {
    const refDomain = getDomain(ref)
    return refDomain.indexOf(domain) !== -1
  }
}

function isSocialMediaDomain (ref) {
  const refDomain = getDomain(ref)
  return socialMediasDomains.some((domain) => refDomain === domain)
}

export {
  getDomain,
  belongsToDomain,
  isSocialMediaDomain
}
