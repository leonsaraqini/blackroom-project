import { useEffect } from 'react'
import source from '../legacy-pages/product-express.html?raw'
import ProjectPage from '../components/ProjectPage.jsx'
import useFreemiusCheckout from '../hooks/useFreemiusCheckout.js'

export default function ProductExpressPage() {
  useFreemiusCheckout()

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('brm-product-express-page')
    root.style.setProperty('--acc', '#ff6a1a')

    return () => {
      root.classList.remove('brm-product-express-page')
      root.style.removeProperty('--acc')
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
