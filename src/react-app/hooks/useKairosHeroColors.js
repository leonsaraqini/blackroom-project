import { useEffect } from 'react'

export default function useKairosHeroColors() {
  useEffect(() => {
    const gsap = window.gsap
    const background = document.querySelector('.brm-hero-bg')

    if (!gsap || !background) return undefined

    const colors = Array.from(background.querySelectorAll('.blob'))
    if (colors.length !== 3) return undefined

    const media = gsap.matchMedia()

    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.to(colors[0], {
        x: '28vw',
        y: '20vh',
        scale: 1.2,
        rotation: 24,
        duration: 7,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })

      gsap.to(colors[1], {
        x: '-32vw',
        y: '-24vh',
        scale: 1.25,
        rotation: -30,
        duration: 9,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })

      gsap.to(colors[2], {
        x: '20vw',
        y: '-30vh',
        scale: 1.35,
        rotation: 36,
        duration: 11,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
    }, background)

    return () => media.revert()
  }, [])
}
