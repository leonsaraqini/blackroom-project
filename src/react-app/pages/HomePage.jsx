import source from '../legacy-pages/index.html?raw'
import LegacyRoutePage from '../components/LegacyRoutePage.jsx'

export default function HomePage() {
  return <LegacyRoutePage source={source} pathname="/" title="Blackroom - Home" />
}
