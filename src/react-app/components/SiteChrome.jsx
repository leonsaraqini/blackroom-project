const navigation = [
  ['/', 'Home'],
  ['/portfolio', 'Portfolio'],
  ['/services', 'Services'],
  ['/contact', 'Contact'],
]

function Cursor() {
  return (
    <div className="mil-ball">
      <span className="mil-icon-1">
        <svg viewBox="0 0 128 128" aria-hidden="true">
          <path d="M106.1,41.9c-1.2-1.2-3.1-1.2-4.2,0c-1.2,1.2-1.2,3.1,0,4.2L116.8,61H11.2l14.9-14.9c1.2-1.2,1.2-3.1,0-4.2c-1.2-1.2-3.1-1.2-4.2,0l-20,20c-1.2,1.2-1.2,3.1,0,4.2l20,20c.6.6,1.4.9,2.1.9s1.5-.3,2.1-.9c1.2-1.2,1.2-3.1,0-4.2L11.2,67h105.5l-14.9,14.9c-1.2,1.2-1.2,3.1,0,4.2c.6.6,1.4.9,2.1.9s1.5-.3,2.1-.9l20-20c1.2-1.2,1.2-3.1,0-4.2z" />
        </svg>
      </span>
      <div className="mil-more-text">More</div>
      <div className="mil-choose-text">Сhoose</div>
    </div>
  )
}

function Preloader() {
  return (
    <div className="mil-preloader">
      <div className="mil-preloader-animation">
        <div className="mil-pos-abs mil-animation-1">
          <p className="mil-h3 mil-muted mil-thin">Shaping</p>
          <p className="mil-h3 mil-muted">Tomorrow,</p>
          <p className="mil-h3 mil-muted mil-thin">Together</p>
        </div>
        <div className="mil-pos-abs mil-animation-2">
          <div className="mil-reveal-frame">
            <p className="mil-reveal-box" />
            <p className="mil-h3 mil-muted mil-thin">Blackroom Production</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function MenuButton() {
  return <div className="mil-menu-btn"><span /></div>
}

function Menu({ pathname }) {
  return (
    <div className="mil-menu-frame">
      <div className="mil-frame-top">
        <a href="/" className="mil-logo">Blackroom</a>
        <MenuButton />
      </div>
      <div className="container">
        <div className="mil-menu-content">
          <div className="row text-center">
            <div className="col-xl-12">
              <nav className="mil-main-menu" id="swupMenu">
                <ul>
                  {navigation.map(([href, label]) => (
                    <li key={href} className={`mil-has-children${pathname === href ? ' mil-active' : ''}`}>
                      <a href={href}>{label}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FixedFrame() {
  return (
    <div className="mil-frame">
      <div className="mil-frame-top">
        <a href="/" className="mil-logo"><img src="/img/blackroom/nav-img.png" alt="Blackroom logo" /></a>
        <MenuButton />
      </div>
      <div className="mil-frame-bottom">
        <div className="mil-current-page" />
        <div className="mil-back-to-top">
          <a href="#top" className="mil-link mil-dark mil-arrow-place"><span>Back to top</span></a>
        </div>
      </div>
    </div>
  )
}

export default function SiteChrome({ pathname }) {
  return (
    <>
      <Cursor />
      <Preloader />
      <div className="mil-progress-track"><div className="mil-progress" /></div>
      <Menu pathname={pathname} />
      <div className="mil-curtain" />
      <FixedFrame />
    </>
  )
}
