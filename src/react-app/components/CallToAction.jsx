import LegacyMarkup from './LegacyMarkup.jsx'

export default function CallToAction({ callToAction }) {
  if (!callToAction) return null

  return (
    <section className="mil-soft-bg">
      <div className="container mil-p-120-120">
        <div className="row">
          <div className="col-lg-10">
            <LegacyMarkup
              as="span"
              className="mil-suptitle mil-suptitle-right mil-suptitle-dark mil-up"
              html={callToAction.suptitleHtml}
            />
          </div>
        </div>
        <div className="mil-center">
          <LegacyMarkup as="h2" className="mil-up mil-mb-60" html={callToAction.headingHtml} />
          <div className="mil-up">
            <a href={callToAction.href} className="mil-button mil-arrow-place">
              <span>{callToAction.label}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
