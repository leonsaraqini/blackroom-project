import { useMemo } from 'react'
import { getPageDefinition } from '../lib/legacyMarkup.js'
import CallToAction from './CallToAction.jsx'
import HiddenElements from './HiddenElements.jsx'
import InnerBanner from './InnerBanner.jsx'
import LegacyMarkup from './LegacyMarkup.jsx'
import SiteChrome from './SiteChrome.jsx'
import SiteFooter from './SiteFooter.jsx'

export default function PageLayout({ source, pathname }) {
  const page = useMemo(() => getPageDefinition(source), [source])

  return (
    <>
      <LegacyMarkup html={page.styles} />
      <div className="mil-wrapper" id="top">
        <SiteChrome pathname={pathname} />
        <div className="mil-content">
          <div id="swupMain" className="mil-main-transition">
            <InnerBanner banner={page.banner} />
            <LegacyMarkup html={page.content} />
            <CallToAction callToAction={page.callToAction} />
            <SiteFooter />
            <HiddenElements />
          </div>
        </div>
      </div>
    </>
  )
}
