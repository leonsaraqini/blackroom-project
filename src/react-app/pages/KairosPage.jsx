import source from '../legacy-pages/kairos.html?raw'
import ProjectPage from '../components/ProjectPage.jsx'
import useKairosHeroColors from '../hooks/useKairosHeroColors.js'
import useKairosHeroEntrance from '../hooks/useKairosHeroEntrance.js'

export default function KairosPage() {
  useKairosHeroColors()
  useKairosHeroEntrance()

  return <ProjectPage source={source} pathname="/kairos" title="Kairos" useSourceFooter />
}
