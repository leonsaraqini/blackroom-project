import { useEffect } from 'react'
import source from '../legacy-pages/product-express.html?raw'
import ProjectPage from '../components/ProjectPage.jsx'
import useFreemiusCheckout from '../hooks/useFreemiusCheckout.js'

export default function ProductExpressPage() {
  useFreemiusCheckout()

  useEffect(() => {
    const root = document.documentElement
    const favicon = document.querySelector('link[rel~="icon"]')
    const previousFaviconHref = favicon?.getAttribute('href')
    const previousFaviconType = favicon?.getAttribute('type')

    root.classList.add('brm-product-express-page')
    root.style.setProperty('--acc', '#ff6a1a')
    favicon?.setAttribute('href', '/img/blackroom/shop/express-wordmark.png')
    favicon?.setAttribute('type', 'image/png')

    return () => {
      root.classList.remove('brm-product-express-page')
      root.style.removeProperty('--acc')

      if (favicon && previousFaviconHref) {
        favicon.setAttribute('href', previousFaviconHref)
      }

      if (favicon && previousFaviconType) {
        favicon.setAttribute('type', previousFaviconType)
      } else {
        favicon?.removeAttribute('type')
      }
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
