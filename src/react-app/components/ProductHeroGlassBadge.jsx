import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import GlassSurface from './GlassSurface.jsx'

export default function ProductHeroGlassBadge() {
  const [badge, setBadge] = useState(null)
  const original = useRef(null)

  useEffect(() => {
    const target = document.querySelector('.brm-phero .brm-phero-badge')
    if (!target) return
    if (original.current?.target !== target) {
      original.current = { target, html: target.innerHTML }
      target.innerHTML = ''
    }
    target.classList.add('brm-hero-glass-mount')
    setBadge(original.current)
    return () => {
      target.classList.remove('brm-hero-glass-mount')
      // The page owns this node and removes it on navigation.
    }
  }, [])

  if (!badge) return null
  return createPortal(
    <GlassSurface width="auto" height="auto" borderRadius={50} backgroundOpacity={0.08}
      className="brm-hero-platform-glass" style={{ display: 'inline-flex' }}>
      <span className="brm-hero-platform-content" dangerouslySetInnerHTML={{ __html: badge.html }} />
    </GlassSurface>,
    badge.target,
  )
}
