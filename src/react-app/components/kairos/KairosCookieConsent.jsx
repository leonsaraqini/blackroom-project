import { useEffect, useState } from 'react'

const STORAGE_KEY = 'kairosCookieConsent'

export default function KairosCookieConsent() {
  const [visible, setVisible] = useState(false)
  const [analytics, setAnalytics] = useState(true)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return undefined
    } catch {
      // If storage is unavailable, the visitor can still make a choice for this view.
    }

    const timeout = window.setTimeout(() => setVisible(true), 800)
    return () => window.clearTimeout(timeout)
  }, [])

  const save = (preferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ essential: true, ...preferences, ts: Date.now() }))
    } catch {
      // Closing the modal should not depend on storage availability.
    }
    setVisible(false)
  }

  return (
    <div
      className={`brm-cookie-overlay${visible ? ' brm-show' : ''}`}
      style={{ '--acc': '#ff6a1a', '--acc2': '#ff3d00' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="brmCookieTitle"
      aria-hidden={!visible}
    >
      <div className="brm-cookie-modal">
        <h3 id="brmCookieTitle">We value your privacy</h3>
        <p>We use essential cookies to keep this site running smoothly. You can also choose whether to allow analytics and marketing cookies below.</p>
        <div className="brm-cookie-cats">
          <CookieCategory title="Analytics" description="Helps us understand how visitors use the site — page views, traffic sources — so we can improve it." checked={analytics} onChange={setAnalytics} />
          <CookieCategory title="Marketing" description="Used to measure campaigns and show you more relevant content across the web." checked={marketing} onChange={setMarketing} />
        </div>
        <div className="brm-cookie-actions">
          <button type="button" className="brm-btn brm-btn-primary" onClick={() => save({ analytics: false, marketing: false })}>Only Essential</button>
          <button type="button" className="brm-btn brm-btn-primary" onClick={() => save({ analytics, marketing })}>Save my Choices</button>
        </div>
      </div>
    </div>
  )
}

function CookieCategory({ title, description, checked, onChange }) {
  return (
    <div className="brm-cookie-cat">
      <div className="brm-cookie-cat-text">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
      <label className="brm-switch">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange?.(event.target.checked)}
          aria-label={`${title} cookies`}
        />
        <span className="brm-track" />
      </label>
    </div>
  )
}
