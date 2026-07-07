import { useEffect } from 'react'

export default function useKairosHeroEntrance() {
  useEffect(() => {
    const gsap = window.gsap
    const hero = document.querySelector('.brm-hero')
    const content = hero?.querySelector('.brm-hero-inner')

    if (!gsap || !hero || !content) return undefined

    const eyebrow = content.querySelector('.brm-eyebrow')
    const heading = content.querySelector('h1')
    const paragraph = content.querySelector('p')
    const buttons = content.querySelectorAll('.brm-hero-actions .brm-btn')
    const scrollCue = hero.querySelector('.brm-scrollcue')
    const heroElements = [eyebrow, heading, paragraph, ...buttons, scrollCue]
    const media = gsap.matchMedia()

    media.add({
      isMobile: '(max-width: 767px)',
      isDesktop: '(min-width: 768px)',
      reduceMotion: '(prefers-reduced-motion: reduce)',
    }, (context) => {
      const { isMobile, reduceMotion } = context.conditions

      if (reduceMotion) {
        gsap.set(heroElements, { autoAlpha: 1, x: 0, y: 0, scale: 1, rotationX: 0, filter: 'none' })
        return
      }

      gsap.set(buttons, {
        autoAlpha: 0,
        y: isMobile ? 14 : 22,
      })

      const timeline = gsap.timeline({
        defaults: { ease: 'power3.out' },
        delay: 0.15,
      })

      timeline
        .fromTo(eyebrow, {
          autoAlpha: 0,
          y: isMobile ? -10 : -18,
          filter: 'blur(8px)',
        }, {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.65,
        })
        .fromTo(heading, {
          autoAlpha: 0,
          y: isMobile ? 30 : 54,
          rotationX: isMobile ? 0 : -14,
          filter: 'blur(12px)',
        }, {
          autoAlpha: 1,
          y: 0,
          rotationX: 0,
          transformPerspective: 700,
          transformOrigin: '50% 100%',
          filter: 'blur(0px)',
          duration: 1,
        }, '-=0.3')
        .fromTo(paragraph, {
          autoAlpha: 0,
          y: isMobile ? 18 : 28,
          filter: 'blur(7px)',
        }, {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.75,
        }, '-=0.55')
        .fromTo(buttons, {
          autoAlpha: 0,
          y: isMobile ? 14 : 22,
        }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.12,
          clearProps: 'transform',
        }, '-=0.42')
        .fromTo(scrollCue, {
          autoAlpha: 0,
        }, {
          autoAlpha: 1,
          duration: 0.8,
        }, '-=0.1')
    }, hero)

    return () => media.revert()
  }, [])
}
