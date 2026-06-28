import PageLayout from './PageLayout.jsx'
import useLegacyRuntime from '../hooks/useLegacyRuntime.js'

export default function LegacyRoutePage({ source, pathname, title }) {
  useLegacyRuntime(title)
  return <PageLayout source={source} pathname={pathname} />
}
