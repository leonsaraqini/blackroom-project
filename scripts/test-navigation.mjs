import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import vm from 'node:vm'
import { getInternalDestination } from '../src/react-app/lib/navigation.js'

const routes = { '/': true, '/portfolio': true, '/contact': true, '/kairos/product-express': true }
const normalise = (path) => (path.replace(/\/+$/, '') || '/').replace(/\.html$/, '')
const current = 'https://blackroom.example/portfolio'

test('routes internal pages and legacy URLs while preserving query strings and fragments', () => {
  for (const href of ['/contact', '/contact.html', '/contact/', '/kairos/product-express?plan=annual#pricing']) {
    assert.equal(getInternalDestination(href, current, routes, normalise)?.href, new URL(href, current).href)
  }
})

test('leaves external links, same-page anchors, downloads and unknown server paths alone', () => {
  for (const href of ['#portfolio', current, 'https://other.example/contact', 'mailto:contact@example.com', '/api/checkout', '/img/work.png', '/missing']) {
    assert.equal(getInternalDestination(href, current, routes, normalise), null, href)
  }
})

test('legacy runtime can mount and clean up repeatedly without accumulating global handlers', async () => {
  const bindings = new Map()
  const document = { querySelector: () => null, querySelectorAll: () => [] }
  let reverts = 0
  let destroyed = 0
  let closed = 0
  const slider = { swiper: { destroy() { destroyed++ } } }
  const root = { querySelectorAll: () => [slider] }
  const $ = (target) => {
    const api = {
      on(event) {
        const events = bindings.get(target) || []
        events.push(event)
        bindings.set(target, events)
        return api
      },
      off(namespace) {
        bindings.set(target, (bindings.get(target) || []).filter((event) => !event.includes(namespace)))
        return api
      },
      find: () => api, addBack: () => api,
      each(callback) { callback.call(slider); return api },
      clone: () => api, appendTo: () => api, fancybox: () => api,
      stop: () => api, width: () => 1440,
    }
    return api
  }
  $.fancybox = { defaults: {}, close() { closed++ }, destroy() {} }
  const gsap = {
    context(callback) { callback(); return { revert() { reverts++ } } },
    registerPlugin() {}, set() {}, to() {}, killTweensOf() {},
    utils: { toArray: () => [] },
  }
  const window = {}
  const sandbox = { window, document, $, gsap, ScrollTrigger: {}, ScrollToPlugin: {}, Swiper: function () {} }
  vm.runInNewContext(await readFile(new URL('../public/js/main.js', import.meta.url), 'utf8'), sandbox)
  assert.equal(bindings.size, 0, 'loading the script must not initialize a page')
  for (let visit = 0; visit < 5; visit++) {
    const cleanup = window.initBlackroomRuntime(root)
    assert.ok(bindings.get(document).includes('pointermove.blackroom'))
    assert.ok(bindings.get('body').includes('mousedown.blackroom'))
    cleanup()
    assert.deepEqual(bindings.get(document), [])
    assert.deepEqual(bindings.get('body'), [])
  }
  assert.equal(reverts, 5)
  assert.equal(destroyed, 5)
  assert.equal(closed, 5)
})
