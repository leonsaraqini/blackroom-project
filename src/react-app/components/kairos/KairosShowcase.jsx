export default function KairosShowcase({
  id,
  eyebrow,
  title,
  titleImage,
  afterEffectsBadge = false,
  description,
  accent,
  accent2,
  href,
  image,
  video,
  poster,
  label = 'Coming soon',
}) {
  const content = (
    <>
      {video ? (
        <video className="brm-showcase-media" autoPlay muted loop playsInline poster={poster}>
          <source src={video} type="video/mp4" />
        </video>
      ) : (
        <div className="brm-showcase-media" style={{ backgroundImage: `url(${image})` }} />
      )}
      <div className="brm-showcase-inner">
        {!afterEffectsBadge && <span className="brm-eyebrow">{eyebrow}</span>}
        {titleImage ? (
          <img className="brm-showcase-wordmark" src={titleImage} alt={title} />
        ) : (
          <h2>{title}</h2>
        )}
        {afterEffectsBadge && (
          <span className="brm-phero-badge brm-showcase-platform">
            <svg className="brm-ae-icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="m9.015 10.55-.572 1.826h1.903l-.583-1.826a21 21 0 0 1-.31-1.133l-.064-.253h-.022l-.114.465c-.074.31-.15.632-.238.921m6.282.396c-.836 0-1.188.759-1.243 1.309h2.354c.01-.495-.21-1.309-1.111-1.309" />
              <path fill="currentColor" fillRule="evenodd" d="M6.77 3.082a47.5 47.5 0 0 1 10.46 0c1.899.212 3.43 1.707 3.653 3.613a45.7 45.7 0 0 1 0 10.61c-.223 1.906-1.754 3.401-3.652 3.614a47.5 47.5 0 0 1-10.461 0c-1.899-.213-3.43-1.708-3.653-3.613a45.7 45.7 0 0 1 0-10.611C3.34 4.789 4.871 3.294 6.77 3.082M11.248 15.5l-.67-2.101H8.222L7.585 15.5H6.188l2.376-7.414h1.727l2.41 7.414zm6.436-2.871c0 .253-.022.451-.044.572h-3.586c.033.968.792 1.386 1.65 1.386c.627 0 1.078-.088 1.485-.242l.198.935c-.462.187-1.1.341-1.87.341c-1.738 0-2.761-1.078-2.761-2.717c0-1.485.902-2.882 2.618-2.882c1.749 0 2.31 1.43 2.31 2.607" clipRule="evenodd" />
            </svg>
            Adobe After Effects
          </span>
        )}
        <p>{description}</p>
        <span className="brm-learn">
          {label} {href && <i className="fa-solid fa-arrow-right" aria-hidden="true" />}
        </span>
      </div>
    </>
  )

  const props = {
    id,
    className: 'brm-showcase brm-feature-band',
    style: { '--acc': accent, '--acc2': accent2 },
  }

  return href ? <a {...props} href={href}>{content}</a> : <section {...props}>{content}</section>
}
