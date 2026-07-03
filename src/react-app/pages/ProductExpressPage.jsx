import source from '../legacy-pages/product-express.html?raw'
import ProjectPage from '../components/ProjectPage.jsx'
import useFreemiusCheckout from '../hooks/useFreemiusCheckout.js'

export default function ProductExpressPage() {
  useFreemiusCheckout()

  return (
    <ProjectPage
      source={source}
      pathname="/kairos/product-express"
      title="Kairos Express"
      useSourceFooter
    />
  )
}
