const legacyRoutes = /href=(['"])(?:\.\/)?(index|portfolio|services|contact|shop|shop-test|perlastone|duravo|troko|rave|pekon|positano|wiegeparadies)\.html(#[^'"]*)?\1/g

export function moderniseLinks(markup) {
  return markup.replace(
    legacyRoutes,
    (_, quote, route, hash = '') => `href=${quote}/${route === 'index' ? '' : route}${hash}${quote}`,
  )
}

export function parseLegacyDocument(source) {
  return new DOMParser().parseFromString(source, 'text/html')
}

function moderniseHref(href) {
  const match = href.match(/^(?:\.\/)?(index|portfolio|services|contact|shop|shop-test|perlastone|duravo|troko|rave|pekon|positano|wiegeparadies)\.html(#[^'\"]*)?$/)
  if (!match) return href
  return `/${match[1] === 'index' ? '' : match[1]}${match[2] || ''}`
}

function getBannerDefinition(node) {
  const banner = node.matches('.mil-inner-banner') ? node : node.querySelector('.mil-inner-banner')
  if (!banner) return null

  const content = banner.querySelector('.mil-banner-content')
  const heading = banner.querySelector('h1')
  const action = banner.querySelector('a.mil-down-arrow')

  return {
    className: banner.className,
    contentClassName: content.className,
    darkBackground: node !== banner && node.classList.contains('mil-dark-bg'),
    inverted: Boolean(banner.querySelector('.mi-invert-fix')),
    animationClassName: banner.querySelector('.mil-animation-frame > .mil-animation')?.className || '',
    breadcrumbsClassName: banner.querySelector('.mil-breadcrumbs').className,
    breadcrumbs: [...banner.querySelectorAll('.mil-breadcrumbs a')].map((link) => ({
      href: moderniseHref(link.getAttribute('href')),
      label: link.textContent.trim(),
    })),
    headingClassName: heading.className,
    headingHtml: heading.innerHTML,
    actionHref: moderniseHref(action.getAttribute('href')),
    actionClassName: action.className,
    actionLabel: action.textContent.trim(),
  }
}

function getCallToActionDefinition(node) {
  if (!node.matches('section.mil-soft-bg') || !node.querySelector('.mil-suptitle')) return null

  const heading = node.querySelector('h2')
  const link = node.querySelector('a.mil-button')
  if (!heading || !link) return null

  return {
    suptitleHtml: node.querySelector('.mil-suptitle').innerHTML,
    headingHtml: heading.innerHTML,
    href: moderniseHref(link.getAttribute('href')),
    label: link.textContent.trim(),
  }
}

export function getPageDefinition(source) {
  const doc = parseLegacyDocument(source)
  const main = doc.querySelector('#swupMain')
  const styles = [...doc.head.querySelectorAll('style')].map((node) => node.outerHTML).join('')
  const content = []
  let banner = null
  let callToAction = null

  for (const node of main?.children || []) {
    if (node.matches('footer, .mil-hidden-elements')) continue

    const bannerDefinition = getBannerDefinition(node)
    if (bannerDefinition) {
      banner = bannerDefinition
      continue
    }

    const callToActionDefinition = getCallToActionDefinition(node)
    if (callToActionDefinition) {
      callToAction = callToActionDefinition
      continue
    }

    content.push(node.outerHTML)
  }

  return {
    title: doc.title || 'Blackroom',
    styles,
    banner,
    callToAction,
    content: moderniseLinks(content.join('')),
  }
}

export function getSharedMarkup(source, selector) {
  const node = parseLegacyDocument(source).querySelector(selector)
  return moderniseLinks(node?.outerHTML || '')
}
