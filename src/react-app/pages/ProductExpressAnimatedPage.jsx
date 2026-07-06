import { useEffect } from 'react'
import source from '../legacy-pages/product-express-animated.html?raw'
import ProjectPage from '../components/ProjectPage.jsx'
import useFreemiusCheckout from '../hooks/useFreemiusCheckout.js'
import useProductExpressScrollAnimations from '../hooks/useProductExpressScrollAnimations.js'

export default function ProductExpressAnimatedPage() {
  useFreemiusCheckout()
  useProductExpressScrollAnimations()

  useEffect(() => {
    const root = document.documentElement
    const favicon = document.querySelector('link[rel~="icon"]')
    const previousHref = favicon?.getAttribute('href')
    const previousType = favicon?.getAttribute('type')

    root.classList.add('brm-product-express-page')
    root.style.setProperty('--acc', '#ff6a1a')
    favicon?.setAttribute('href', '/img/blackroom/shop/express-wordmark.png')
    favicon?.setAttribute('type', 'image/png')

    return () => {
      root.classList.remove('brm-product-express-page')
      root.style.removeProperty('--acc')
      if (favicon && previousHref) favicon.setAttribute('href', previousHref)
      if (favicon && previousType) favicon.setAttribute('type', previousType)
      else favicon?.removeAttribute('type')
    }
  }, [])

  return (
    <ProjectPage
      source={source}
      pathname="/kairos/product-express"
      title="Kairos Express"
      useSourceFooter
    />
  )
}
