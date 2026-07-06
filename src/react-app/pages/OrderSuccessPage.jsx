import HiddenElements from '../components/HiddenElements.jsx'
import SiteChrome from '../components/SiteChrome.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import './OrderSuccessPage.css'

export default function OrderSuccessPage() {
  let checkoutResult = null
  try {
    checkoutResult = JSON.parse(sessionStorage.getItem('freemiusCheckoutResult'))
  } catch {
    // A missing or invalid browser-only result falls back to the purchase message.
  }

  const isTrial = checkoutResult?.type === 'trial'
  const trialEndDate = checkoutResult?.trialEndsAt ? new Date(checkoutResult.trialEndsAt) : null
  const trialEnd = trialEndDate && !Number.isNaN(trialEndDate.getTime())
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(trialEndDate)
    : null

  return (
    <>
      <div className="mil-wrapper" id="top">
        <SiteChrome pathname="/order-success" />
        <div className="mil-content">
          <div id="swupMain" className="mil-main-transition">
            <main className="order-success">
              <div className="container">
                <section className="order-success-card" aria-labelledby="order-success-title">
                  <div className="order-success-icon" aria-hidden="true">✓</div>
                  <p className="order-success-eyebrow">Kairos Express</p>
                  <h1 id="order-success-title" className="mil-h2">
                    {isTrial ? 'Trial active' : 'Order created successfully'}
                  </h1>
                  <p className="order-success-copy">
                    {isTrial
                      ? trialEnd ? `Trial active until ${trialEnd}.` : 'Your free trial is active.'
                      : 'Thank you for your purchase. Freemius has sent your license key and download links to your email address.'}
                  </p>
                  <p className="order-success-note">
                    If the email does not arrive within a few minutes, check your spam folder or open the Freemius Customer Portal.
                  </p>
                  <div className="order-success-actions">
                    <a className="mil-button" href="/shop"><span>Return to shop</span></a>
                  </div>
                </section>
              </div>
            </main>
            <SiteFooter />
            <HiddenElements />
          </div>
        </div>
      </div>
    </>
  )
}
