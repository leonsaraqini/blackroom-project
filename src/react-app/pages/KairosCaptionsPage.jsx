import { useEffect } from 'react'
import source from '../legacy-pages/product-captions.html?raw'
import ProjectPage from '../components/ProjectPage.jsx'
import ProductHeroGlassBadge from '../components/ProductHeroGlassBadge.jsx'
import useFreemiusCheckout from '../hooks/useFreemiusCheckout.js'
import useProductExpressScrollAnimations from '../hooks/useProductExpressScrollAnimations.js'

export default function KairosCaptionsPage() {
  useFreemiusCheckout({ sandboxMode: true, sandboxEndpoint: '/api/freemius/captions/sandbox' })
  useProductExpressScrollAnimations()

  useEffect(() => {
    const root = document.documentElement
    const favicon = document.querySelector('link[rel~="icon"]')
    const previousHref = favicon?.getAttribute('href')
    const previousType = favicon?.getAttribute('type')

    root.classList.add('brm-product-express-page', 'brm-product-captions-page')
    root.style.setProperty('--acc', '#43a358')
    favicon?.setAttribute('href', '/img/blackroom/shop/captions-wordmark.png')
    favicon?.setAttribute('type', 'image/png')

    return () => {
      root.classList.remove('brm-product-express-page', 'brm-product-captions-page')
      root.style.removeProperty('--acc')
      if (favicon && previousHref) favicon.setAttribute('href', previousHref)
      if (favicon && previousType) favicon.setAttribute('type', previousType)
      else favicon?.removeAttribute('type')
    }
  }, [])

  return (
    <>
    <ProjectPage
      source={source}
      pathname="/kairos/product-captions"
      title="Kairos Captions"
      useSourceFooter
    />
    <ProductHeroGlassBadge />
    </>
  )
}
