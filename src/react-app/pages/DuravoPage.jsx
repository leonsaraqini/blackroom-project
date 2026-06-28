import source from '../legacy-pages/duravo.html?raw'
import ProjectPage from '../components/ProjectPage.jsx'

export default function DuravoPage() {
  return <ProjectPage source={source} pathname="/duravo" title="Duravo - Project" />
}
