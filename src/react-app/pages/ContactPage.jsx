import source from '../legacy-pages/contact.html?raw'
import LegacyRoutePage from '../components/LegacyRoutePage.jsx'

export default function ContactPage() {
  return <LegacyRoutePage source={source} pathname="/contact" title="Blackroom - Contact" />
}
