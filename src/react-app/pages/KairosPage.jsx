import source from '../legacy-pages/kairos.html?raw'
import ProjectPage from '../components/ProjectPage.jsx'

export default function KairosPage() {
  return <ProjectPage source={source} pathname="/kairos" title="Kairos" useSourceFooter />
}
