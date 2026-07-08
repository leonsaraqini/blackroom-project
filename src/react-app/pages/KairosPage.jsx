import { useEffect } from 'react'
import KairosCookieConsent from '../components/kairos/KairosCookieConsent.jsx'
import KairosFooter from '../components/kairos/KairosFooter.jsx'
import KairosHero from '../components/kairos/KairosHero.jsx'
import KairosShowcase from '../components/kairos/KairosShowcase.jsx'
import KairosValues from '../components/kairos/KairosValues.jsx'
import useKairosHeroEntrance from '../hooks/useKairosHeroEntrance.js'

const products = [
  {
    id: 'bundle',
    eyebrow: 'Adobe After Effects',
    title: 'Kairos Express',
    titleImage: '/img/blackroom/shop/express-wordmark.png',
    afterEffectsBadge: true,
    description: 'The expression library & composer for After Effects — save, search and inject your favorite expressions, each with a visual control for every variable.',
    accent: '#ff6a1a',
    accent2: '#ff3d00',
    href: '/kairos/product-express',
    video: '/img/KairosExpress-HeroSection.mp4',
    poster: '/img/blackroom/shop/express.svg',
    label: 'Learn more',
  },
  {
    id: 'kairos-autoframe',
    eyebrow: 'Adobe Premiere Pro, Final Cut, Davinci Resolve',
    title: 'Kairos Auto Frame',
    description: 'Edit once, deliver everywhere. Automatically remove silent pauses, separate camera shots, and let intelligent subject tracking frame your video perfectly for every aspect ratio.',
    accent: '#6c63ff',
    accent2: '#00c2ff',
    image: '/img/blackroom/shop/Kairos_Autoframe.jpg',
  },
  {
    id: 'kairos-hand-drawn',
    eyebrow: 'Adobe After Effects',
    title: 'Kairos Hand Drawn',
    description: 'The authentic sketch engine — transform standard fonts into dynamic, hand-written typography with built-in wiggle and raw, frame-by-frame animation styles.',
    accent: '#ffd84d',
    accent2: '#ff7043',
    image: '/img/blackroom/shop/Kairos_HandDrawn.jpg',
  },
  {
    id: 'kairos-podcast-director',
    eyebrow: 'Adobe Premiere Pro, Final Cut, Davinci Resolve',
    title: 'Kairos Podcast Director',
    description: 'The complete multi-cam podcast solution — effortlessly sync your raw video and audio, utilize intelligent volume tracking to separate voices from noise, and automatically edit the conversation by putting the active speaker front and center.',
    accent: '#00c2ff',
    accent2: '#6c63ff',
    image: '/img/blackroom/shop/Kairos_PodcastDirector.jpg',
  },
  {
    id: 'kairos-film-emulation',
    eyebrow: 'Adobe Premiere Pro, Final Cut, Davinci Resolve',
    title: 'Kairos Film Emulation',
    description: 'The advanced color grading suite — take total control over your aesthetic with deep, professional-grade tools designed to give any digital footage a rich, true-to-life film look.',
    accent: '#d6a85f',
    accent2: '#8c6239',
    image: '/img/blackroom/shop/Kairos_FilmEmulation.jpg',
  },
  {
    id: 'kairos-captions',
    eyebrow: 'Adobe Premiere Pro, After Effects, Final Cut, Davinci Resolve',
    title: 'Kairos Captions',
    description: 'Global captions in a single click. Instantly transcribe video in more than 120 languages and style your subtitles using a premium catalog of modern designs.',
    accent: '#ff4d8d',
    accent2: '#ff8a00',
    image: '/img/blackroom/shop/Kairos_Captions.jpg',
  },
]

export default function KairosPage() {
  useKairosHeroEntrance()

  useEffect(() => {
    document.title = 'Kairos'
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="mil-wrapper" id="top">
      <main className="mil-content">
        <div id="swupMain" className="mil-main-transition">
          <div className="mil-dark-bg brm">
            <div className="mi-invert-fix brm-fix">
              <KairosHero />
              {products.map((product) => <KairosShowcase key={product.id} {...product} />)}
              <KairosValues />
            </div>
          </div>
          <KairosFooter />
        </div>
      </main>
      <KairosCookieConsent />
    </div>
  )
}
