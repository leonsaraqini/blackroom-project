import source from '../legacy-pages/services.html?raw'
import LegacyRoutePage from '../components/LegacyRoutePage.jsx'

export default function ServicesPage() {
  return <LegacyRoutePage source={source} pathname="/services" title="Blackroom - Services" />
}
