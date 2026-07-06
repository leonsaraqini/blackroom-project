import { useEffect } from 'react'

export default function useProductExpressScrollAnimations() {
  useEffect(() => {
    const gsap = window.gsap
    const ScrollTrigger = window.ScrollTrigger
    const root = document.querySelector('.brm-express-animated')

    if (!root || !gsap || !ScrollTrigger) return undefined

    gsap.registerPlugin(ScrollTrigger)

    const context = gsap.context(() => {
      const media = gsap.matchMedia()

      media.add(
        {
          desktop: '(min-width: 769px)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        ({ conditions }) => {
          const { desktop, reduceMotion } = conditions
          const heroParts = root.querySelectorAll(
            '.brm-back-link, .brm-phero-logo, .brm-phero-badge, .brm-phero h1, .brm-phero-tag, .brm-phero-actions > *',
          )

          if (reduceMotion) {
            gsap.set(heroParts, { autoAlpha: 1, x: 0, y: 0, scale: 1 })
            return
          }

          const hero = gsap.timeline({ defaults: { ease: 'power3.out' } })
          hero
            .to('.brm-back-link', { autoAlpha: 1, x: 0, duration: 0.55 }, 0.15)
            .to('.brm-phero-logo', { autoAlpha: 1, y: 0, scale: 1, duration: 0.8 }, 0.3)
            .to('.brm-phero-badge', { autoAlpha: 1, y: 0, duration: 0.6 }, 0.58)
            .to('.brm-phero h1', { autoAlpha: 1, y: 0, duration: 0.8 }, 0.74)
            .to('.brm-phero-tag', { autoAlpha: 1, y: 0, duration: 0.7 }, 0.98)
            .to('.brm-phero-actions .brm-btn-primary', { autoAlpha: 1, y: 0, duration: 0.65 }, 1.18)
            .to('.brm-phero-price', { autoAlpha: 1, y: 0, duration: 0.55 }, 1.34)

          gsap.to('.brm-phero-media', {
            yPercent: 12,
            scale: 1.08,
            ease: 'none',
            scrollTrigger: {
              trigger: '.brm-phero',
              start: 'top top',
              end: 'bottom top',
              scrub: 0.8,
            },
          })

          gsap.from('.brm-intro > .brm-container > h2, .brm-intro > .brm-container > p', {
            autoAlpha: 0,
            y: 44,
            stagger: 0.12,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: '.brm-intro', start: 'top 78%', once: true },
          })

          gsap.from('.brm-reel', {
            autoAlpha: 0,
            y: 50,
            scale: 0.94,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: '.brm-reel', start: 'top 84%', once: true },
          })

          gsap.utils.toArray('.brm-feature-row').forEach((row) => {
            const text = row.querySelector('.brm-feature-text')
            const mediaElement = row.querySelector('.brm-feature-img')
            const reversed = row.classList.contains('brm-reverse')
            const timeline = gsap.timeline({
              scrollTrigger: { trigger: row, start: 'top 74%', once: true },
              defaults: { ease: 'power3.out' },
            })

            timeline
              .from(text, { autoAlpha: 0, x: desktop ? (reversed ? 70 : -70) : 0, y: desktop ? 0 : 36, duration: 0.9 })
              .from(mediaElement, { autoAlpha: 0, x: desktop ? (reversed ? -70 : 70) : 0, y: desktop ? 0 : 36, scale: 0.95, duration: 1 }, '-=0.72')
              .from(row.querySelectorAll('.brm-feature-list li'), { autoAlpha: 0, y: 14, stagger: 0.08, duration: 0.42 }, '-=0.48')
          })

          gsap.utils.toArray('.brm-section-head').forEach((heading) => {
            if (heading.closest('.brm-faq')) return

            gsap.from(heading.children, {
              autoAlpha: 0,
              y: 34,
              stagger: 0.1,
              duration: 0.7,
              ease: 'power3.out',
              scrollTrigger: { trigger: heading, start: 'top 82%', once: true },
            })
          })

          gsap.utils.toArray('.brm-highlights-grid').forEach((grid) => {
            gsap.from(grid.querySelectorAll('.brm-hl-card'), {
              autoAlpha: 0,
              y: 32,
              scale: 0.78,
              transformOrigin: 'center bottom',
              stagger: 0.16,
              duration: 0.72,
              ease: 'back.out(1.7)',
              scrollTrigger: {
                trigger: grid,
                start: 'top 84%',
                once: true,
              },
            })
          })

          gsap.from('.brm-price-card', {
            autoAlpha: 0,
            y: 55,
            scale: 0.96,
            stagger: 0.12,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: '.brm-pricing-grid', start: 'top 82%', once: true },
          })

        },
      )

      return () => media.revert()
    }, root)

    const refresh = () => ScrollTrigger.refresh()
    const pricingGrid = root.querySelector('.brm-pricing-grid.brm-three')
    const pricingCards = pricingGrid ? [...pricingGrid.querySelectorAll('.brm-price-card')] : []
    let pricingFrame = 0
    let pointerX = 0
    let pointerY = 0

    const paintPricingSpotlight = () => {
      pricingFrame = 0
      pricingCards.forEach((card) => {
        const rect = card.getBoundingClientRect()
        const localX = pointerX - rect.left
        const localY = pointerY - rect.top
        const distanceX = Math.max(rect.left - pointerX, 0, pointerX - rect.right)
        const distanceY = Math.max(rect.top - pointerY, 0, pointerY - rect.bottom)
        const distance = Math.hypot(distanceX, distanceY)

        card.style.setProperty('--pricing-pointer-x', `${localX}px`)
        card.style.setProperty('--pricing-pointer-y', `${localY}px`)
        card.style.setProperty('--pricing-spot-opacity', String(Math.max(0, 1 - distance / 180)))
      })
    }

    const movePricingSpotlight = (event) => {
      pointerX = event.clientX
      pointerY = event.clientY
      if (!pricingFrame) pricingFrame = requestAnimationFrame(paintPricingSpotlight)
    }

    const clearPricingSpotlight = () => {
      pricingCards.forEach((card) => card.style.setProperty('--pricing-spot-opacity', '0'))
    }

    const enablePricingSpotlight = pricingGrid
      && window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches

    if (enablePricingSpotlight) {
      pricingGrid.addEventListener('pointermove', movePricingSpotlight)
      pricingGrid.addEventListener('pointerleave', clearPricingSpotlight)
    }

    const faqCleanups = gsap.utils.toArray('.brm-faq-item').map((item) => {
      const summary = item.querySelector('summary')
      const answer = item.querySelector('p')
      if (!summary || !answer) return () => {}

      const toggleAnswer = (event) => {
        event.preventDefault()

        if (item.open) {
          gsap.to(answer, {
            height: 0,
            autoAlpha: 0,
            paddingBottom: 0,
            duration: 0.35,
            ease: 'power2.inOut',
            onComplete: () => {
              item.open = false
              gsap.set(answer, { clearProps: 'height,opacity,visibility,paddingBottom' })
              refresh()
            },
          })
          return
        }

        item.open = true
        const answerPaddingBottom = window.getComputedStyle(answer).paddingBottom
        const answerHeight = answer.scrollHeight
        gsap.fromTo(
          answer,
          { height: 0, autoAlpha: 0, paddingBottom: 0 },
          {
            height: answerHeight,
            autoAlpha: 1,
            paddingBottom: answerPaddingBottom,
            duration: 0.42,
            ease: 'power2.out',
            clearProps: 'height,opacity,visibility,paddingBottom',
            onComplete: refresh,
          },
        )
      }

      summary.addEventListener('click', toggleAnswer)
      return () => summary.removeEventListener('click', toggleAnswer)
    })

    root.querySelectorAll('video').forEach((video) => video.addEventListener('loadedmetadata', refresh, { once: true }))
    requestAnimationFrame(refresh)

    return () => {
      root.querySelectorAll('video').forEach((video) => video.removeEventListener('loadedmetadata', refresh))
      if (pricingFrame) cancelAnimationFrame(pricingFrame)
      if (enablePricingSpotlight) {
        pricingGrid.removeEventListener('pointermove', movePricingSpotlight)
        pricingGrid.removeEventListener('pointerleave', clearPricingSpotlight)
      }
      faqCleanups.forEach((cleanup) => cleanup())
      context.revert()
    }
  }, [])
}
