const values = [
  {
    icon: 'fa-bolt',
    title: 'Install in minutes',
    description: 'A simple installer gets you up and running fast — no fiddly setup or config files.',
  },
  {
    icon: 'fa-arrows-rotate',
    title: 'Kept up to date',
    description: 'Buy once and keep receiving improvements and fixes — updates included with every plan.',
  },
  {
    icon: 'fa-headset',
    title: 'Real human support',
    description: 'Talk to the people who built it. Priority help whenever you need a hand.',
  },
]

export default function KairosValues() {
  return (
    <section className="brm-values">
      <div className="brm-container">
        <div className="brm-section-head">
          <h2>Built to make you faster</h2>
          <p>No bloat, no lock-in. Just well-crafted tools backed by a team that actually answers.</p>
        </div>
        <div className="brm-values-grid">
          {values.map(({ icon, title, description }) => (
            <article className="brm-value" key={title}>
              <div className="brm-value-ic"><i className={`fa-solid ${icon}`} aria-hidden="true" /></div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
