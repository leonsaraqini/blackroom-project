import HiddenElements from '../components/HiddenElements.jsx'
import SiteChrome from '../components/SiteChrome.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import './OrderSuccessPage.css'

export default function OrderSuccessPage() {
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
                  <h1 id="order-success-title" className="mil-h2">Order created successfully</h1>
                  <p className="order-success-copy">
                    Thank you for your purchase. Freemius has sent your license key and download links to your email address.
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
