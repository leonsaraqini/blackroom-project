import source from '../legacy-pages/rave.html?raw'
import ProjectPage from '../components/ProjectPage.jsx'

export default function RavePage() {
  return <ProjectPage source={source} pathname="/rave" title="Rave - Project" />
}
