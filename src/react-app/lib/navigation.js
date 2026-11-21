// Only intercept known page routes. Files, APIs, external URLs and same-page
// fragments retain native browser behavior.
export function getInternalDestination(href, currentHref, routes, normalisePath) {
  const destination = new URL(href, currentHref)
  const current = new URL(currentHref)
  if (destination.origin !== current.origin || !['http:', 'https:'].includes(destination.protocol)) return null
  if (!routes[normalisePath(destination.pathname)]) return null
  if (destination.pathname === current.pathname && destination.search === current.search) return null
  return destination
}
