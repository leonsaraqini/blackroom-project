import source from '../legacy-pages/shop-test.html?raw'
import LegacyRoutePage from '../components/LegacyRoutePage.jsx'
import useFreemiusCheckout from '../hooks/useFreemiusCheckout.js'

export default function ShopTestPage() {
  useFreemiusCheckout({ sandboxMode: true })

  return <LegacyRoutePage source={source} pathname="/shop-test" title="Blackroom - Shop Test" />
}
