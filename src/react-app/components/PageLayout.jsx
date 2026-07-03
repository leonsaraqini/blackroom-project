import { useMemo } from 'react'
import { getPageDefinition } from '../lib/legacyMarkup.js'
import CallToAction from './CallToAction.jsx'
import HiddenElements from './HiddenElements.jsx'
import InnerBanner from './InnerBanner.jsx'
import LegacyMarkup from './LegacyMarkup.jsx'
import SiteChrome from './SiteChrome.jsx'
import SiteFooter from './SiteFooter.jsx'

export default function PageLayout({ source, pathname, useSourceFooter = false }) {
  const page = useMemo(() => getPageDefinition(source), [source])
  const showSiteChrome = !/^\/kairos(?:\/|$)/.test(pathname)

  return (
    <>
      <LegacyMarkup html={page.styles} />
      <div className="mil-wrapper" id="top">
        {showSiteChrome && <SiteChrome pathname={pathname} />}
        <div className="mil-content">
          <div id="swupMain" className="mil-main-transition">
            <InnerBanner banner={page.banner} />
            <LegacyMarkup html={page.content} />
            <CallToAction callToAction={page.callToAction} />
            {useSourceFooter && page.footer
              ? <LegacyMarkup html={page.footer} />
              : <SiteFooter />}
            <HiddenElements />
          </div>
        </div>
      </div>
    </>
  )
}
