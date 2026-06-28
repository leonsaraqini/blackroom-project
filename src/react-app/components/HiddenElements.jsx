import sharedTemplate from '../legacy-pages/index.html?raw'
import { getSharedMarkup } from '../lib/legacyMarkup.js'
import LegacyMarkup from './LegacyMarkup.jsx'

const hiddenElements = getSharedMarkup(sharedTemplate, '.mil-hidden-elements')

export default function HiddenElements() {
  return <LegacyMarkup html={hiddenElements} />
}
