import FloatingLines from '../FloatingLines.jsx'

export default function KairosHero() {
  return (
    <section className="brm-hero">
      <div className="brm-hero-bg" aria-hidden="true">
        <FloatingLines
          linesGradient={['#7c3aed', '#000000', '#f97316']}
          enabledWaves={['top', 'middle', 'bottom']}
          lineCount={8}
          lineDistance={27.5}
          animationSpeed={2.2}
          interactive={false}
          bendRadius={16.5}
          bendStrength={5}
        />
      </div>
      <div className="brm-hero-vignette" aria-hidden="true" />
      <div className="brm-hero-inner">
        {/* <span className="brm-eyebrow">Blackroom Tools</span> */}
        <h1>Create <span className="brm-hl">without limits</span></h1>
        <p>Pro creative tools built by our team to speed up your workflow — starting with Kairos Express for After Effects.</p>
        <div className="brm-hero-actions">
          <a href="/kairos/product-express" className="brm-btn brm-btn-primary">
            Explore Kairos Express <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </a>
          <a href="/contact" className="brm-btn brm-btn-ghost">Talk to us</a>
        </div>
      </div>
      <div className="brm-scrollcue" aria-hidden="true">Scroll<span /></div>
    </section>
  )
}
