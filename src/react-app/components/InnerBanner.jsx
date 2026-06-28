import LegacyMarkup from './LegacyMarkup.jsx'

function BannerContent({ banner }) {
  return (
    <div className={banner.contentClassName}>
      {banner.animationClassName && (
        <div className="mil-animation-frame">
          <div
            className={banner.animationClassName}
            data-value-1="6"
            data-value-2="1.4"
          />
        </div>
      )}
      <div className="container">
        <ul className={banner.breadcrumbsClassName}>
          {banner.breadcrumbs.map(({ href, label }) => (
            <li key={`${href}-${label}`}><a href={href}>{label}</a></li>
          ))}
        </ul>
        <LegacyMarkup as="h1" className={banner.headingClassName} html={banner.headingHtml} />
        <a href={banner.actionHref} className={banner.actionClassName}>
          <span>{banner.actionLabel}</span>
        </a>
      </div>
    </div>
  )
}

export default function InnerBanner({ banner }) {
  if (!banner) return null

  const content = <BannerContent banner={banner} />
  const inner = (
    <div className={banner.className}>
      {banner.inverted ? <div className="mi-invert-fix">{content}</div> : content}
    </div>
  )

  return banner.darkBackground ? <div className="mil-dark-bg">{inner}</div> : inner
}
