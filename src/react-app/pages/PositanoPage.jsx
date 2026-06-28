import source from '../legacy-pages/positano.html?raw'
import ProjectPage from '../components/ProjectPage.jsx'

export default function PositanoPage() {
  return <ProjectPage source={source} pathname="/positano" title="Positano - Project" />
}
