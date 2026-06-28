import source from '../legacy-pages/perlastone.html?raw'
import ProjectPage from '../components/ProjectPage.jsx'

export default function PerlastonePage() {
  return <ProjectPage source={source} pathname="/perlastone" title="Perla Stone - Project" />
}
