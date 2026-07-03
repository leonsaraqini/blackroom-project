import LegacyRoutePage from './LegacyRoutePage.jsx'

export default function ProjectPage({ source, pathname, title, useSourceFooter = false }) {
  return (
    <LegacyRoutePage
      source={source}
      pathname={pathname}
      title={title}
      useSourceFooter={useSourceFooter}
    />
  )
}
