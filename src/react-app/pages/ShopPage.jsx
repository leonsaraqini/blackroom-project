import source from '../legacy-pages/shop.html?raw'
import LegacyRoutePage from '../components/LegacyRoutePage.jsx'

export default function ShopPage() {
  return <LegacyRoutePage source={source} pathname="/shop" title="Blackroom - Shop" />
}
