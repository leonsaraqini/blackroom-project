import source from '../legacy-pages/portfolio.html?raw'
import LegacyRoutePage from '../components/LegacyRoutePage.jsx'

export default function PortfolioPage() {
  return <LegacyRoutePage source={source} pathname="/portfolio" title="Blackroom - Portfolio" />
}
