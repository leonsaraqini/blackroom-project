import sharedTemplate from '../legacy-pages/index.html?raw'
import { getSharedMarkup } from '../lib/legacyMarkup.js'
import LegacyMarkup from './LegacyMarkup.jsx'

const footer = getSharedMarkup(sharedTemplate, 'footer')

export default function SiteFooter() {
  return <LegacyMarkup html={footer} />
}
