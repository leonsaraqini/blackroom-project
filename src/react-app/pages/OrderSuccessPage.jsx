import { useEffect } from 'react'
import kairosTemplate from '../legacy-pages/kairos.html?raw'
import LegacyMarkup from '../components/LegacyMarkup.jsx'
import { getSharedMarkup } from '../lib/legacyMarkup.js'
import './OrderSuccessPage.css'

const kairosFooter = getSharedMarkup(kairosTemplate, 'footer')

export default function OrderSuccessPage() {
  useEffect(() => {
    document.title = 'Purchase successful - Blackroom'
    window.scrollTo(0, 0)
  }, [])

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
        <div className="mil-content">
          <div id="swupMain" className="mil-main-transition">
            <main className="order-success mil-dark-bg brm">
              <div className="mi-invert-fix brm-fix order-success-inner">
                <div className="container">
                  <section className="order-success-card" aria-labelledby="order-success-title">
                    <div className="order-success-icon" aria-hidden="true">
                      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path fill="currentColor" d="M16.972 6.251a2 2 0 0 0-2.72.777l-3.713 6.682l-2.125-2.125a2 2 0 1 0-2.828 2.828l4 4c.378.379.888.587 1.414.587l.277-.02a2 2 0 0 0 1.471-1.009l5-9a2 2 0 0 0-.776-2.72" />
                      </svg>
                    </div>
                    <p className="order-success-eyebrow">Kairos Express</p>
                    <h1 id="order-success-title">
                      {isTrial ? 'Trial active' : 'Purchase successful'}
                    </h1>
                    <p className="order-success-copy">
                      {isTrial
                        ? `${trialEnd ? `Trial active until ${trialEnd}.` : 'Your free trial is active.'} Please check your email for the installer.`
                        : 'Thank you for your purchase. Freemius has sent your license key and download links to your email address.'}
                    </p>

                    <div className="order-success-actions">
                      <a className="brm-btn brm-btn-primary" href="/kairos">
                        Return to shop <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                      </a>
                    </div>
                  </section>
                </div>
              </div>
            </main>
            <LegacyMarkup html={kairosFooter} />
          </div>
        </div>
      </div>
    </>
  )
}
