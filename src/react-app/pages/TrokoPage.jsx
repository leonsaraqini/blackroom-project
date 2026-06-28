import source from '../legacy-pages/troko.html?raw'
import ProjectPage from '../components/ProjectPage.jsx'

export default function TrokoPage() {
  return <ProjectPage source={source} pathname="/troko" title="Trokadero - Project" />
}
