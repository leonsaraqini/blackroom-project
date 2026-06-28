import source from '../legacy-pages/pekon.html?raw'
import ProjectPage from '../components/ProjectPage.jsx'

export default function PekonPage() {
  return <ProjectPage source={source} pathname="/pekon" title="Pekon - Project" />
}
