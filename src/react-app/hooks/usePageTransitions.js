import { useLayoutEffect, useRef, useState } from 'react'
import { getInternalDestination } from '../lib/navigation.js'

const entryKey = () => crypto.randomUUID()

export default function usePageTransitions(routes, normalisePath) {
  const [location, setLocation] = useState(() => ({
    url: new URL(window.location.href),
    key: window.history.state?.blackroomKey || entryKey(),
    scroll: { x: 0, y: 0 },
    initial: true,
  }))
  const current = useRef(location)
  const curtain = useRef(null)
  const animation = useRef(null)
  const navigation = useRef(0)
  const positions = useRef(new Map())

  useLayoutEffect(() => {
    current.current = location
    const token = navigation.current
    let frame
    let nextFrame
    // Child layout effects initialize page animations before we uncover them.
    frame = requestAnimationFrame(() => {
      nextFrame = requestAnimationFrame(() => {
        if (token !== navigation.current) return
        const hash = location.url.hash.slice(1)
        let target
        try { target = hash && document.getElementById(decodeURIComponent(hash)) } catch { /* Invalid fragment. */ }
        if (target) target.scrollIntoView()
        else window.scrollTo(location.scroll.x, location.scroll.y)
        if (!location.initial) {
          const heading = document.querySelector('#root h1')
          if (heading) {
            heading.setAttribute('tabindex', '-1')
            heading.focus({ preventScroll: true })
          }
        }
        animation.current?.cancel()
        curtain.current.style.opacity = '0'
        curtain.current.style.pointerEvents = 'none'
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          animation.current = curtain.current.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: 260, easing: 'ease-out',
          })
        }
        window.ScrollTrigger?.refresh()
      })
    })
    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(nextFrame)
    }
  }, [location])

  useLayoutEffect(() => {
    const previousRestoration = history.scrollRestoration
    history.scrollRestoration = 'manual'
    history.replaceState({ ...history.state, blackroomKey: current.current.key }, '')

    const navigate = async (url, { pop = false, key, scroll = { x: 0, y: 0 } } = {}) => {
      const token = ++navigation.current
      positions.current.set(current.current.key, { x: window.scrollX, y: window.scrollY })
      animation.current?.cancel()
      curtain.current.style.pointerEvents = 'all'
      curtain.current.style.opacity = '1'
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        animation.current = curtain.current.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 180, easing: 'ease-in',
        })
        try { await animation.current.finished } catch { return }
      }
      if (token !== navigation.current) return
      const nextKey = key || entryKey()
      if (!pop) history.pushState({ blackroomKey: nextKey }, '', url)
      setLocation({ url, key: nextKey, scroll, initial: false })
    }

    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const link = event.target.closest?.('a[href]')
      if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self') || link.matches('[data-no-swup], [data-no-transition], [data-fancybox]')) return
      const destination = getInternalDestination(link.href, window.location.href, routes, normalisePath)
      if (!destination) return
      event.preventDefault()
      navigate(destination)
    }
    const onPopState = (event) => {
      const url = new URL(window.location.href)
      const key = event.state?.blackroomKey || entryKey()
      // Browsing fragment history must not remount the page or restart its intro.
      if (url.pathname === current.current.url.pathname && url.search === current.current.url.search) {
        let target
        try { target = url.hash && document.getElementById(decodeURIComponent(url.hash.slice(1))) } catch { /* Invalid fragment. */ }
        if (target) target.scrollIntoView()
        else window.scrollTo(0, 0)
        current.current = { ...current.current, url }
        return
      }
      if (!routes[normalisePath(url.pathname)]) {
        window.location.reload()
        return
      }
      navigate(url, { pop: true, key, scroll: positions.current.get(key) })
    }
    // Checkout redirects can use the same transition lifecycle.
    const onNavigate = (event) => {
      const destination = getInternalDestination(event.detail, window.location.href, routes, normalisePath)
      if (destination) navigate(destination)
    }
    document.addEventListener('click', onClick)
    window.addEventListener('popstate', onPopState)
    window.addEventListener('blackroom:navigate', onNavigate)
    return () => {
      ++navigation.current
      animation.current?.cancel()
      history.scrollRestoration = previousRestoration
      document.removeEventListener('click', onClick)
      window.removeEventListener('popstate', onPopState)
      window.removeEventListener('blackroom:navigate', onNavigate)
    }
  }, [routes, normalisePath])

  return { location, curtain }
}
