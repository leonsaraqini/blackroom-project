export default function KairosFooter() {
  return (
    <footer className="mil-dark-bg">
      <div className="mi-invert-fix">
        <div className="container" style={{ padding: '64px 0' }}>
          <div className="brm-footer-layout">
            <div className="brm-footer-info">
              <p className="brm-footer-note">
                <i className="fa-solid fa-shield-halved" aria-hidden="true" /> PCI-compliant checkout with SSL encryption. Available payment methods may vary by region.
              </p>
              <p className="brm-footer-contact">
                For any help, write to us at <a href="mailto:contact@blackroomprod.com">contact@blackroomprod.com</a>
              </p>
            </div>
            <div className="brm-footer-payments">
              <img
                className="brm-security-badge"
                src="/img/blackroom/shop/security-badge-dark-black-bkg.svg"
                alt="Secure payments powered by Freemius. Visa, Mastercard, American Express, iDEAL, and PayPal accepted."
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
