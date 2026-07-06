import { useEffect } from 'react'

const CHECKOUT_SCRIPT_ID = 'freemius-checkout-script'
const CHECKOUT_SCRIPT_SRC = 'https://checkout.freemius.com/js/v1/'
const SANDBOX_ENDPOINT = '/api/freemius/sandbox'
const CHECKOUT_RESULT_KEY = 'freemiusCheckoutResult'

function loadFreemiusCheckout() {
  if (window.FS?.Checkout) return Promise.resolve()

  const existing = document.getElementById(CHECKOUT_SCRIPT_ID)
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', resolve, { once: true })
      existing.addEventListener('error', reject, { once: true })
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = CHECKOUT_SCRIPT_ID
    script.src = CHECKOUT_SCRIPT_SRC
    script.async = true
    script.addEventListener('load', resolve, { once: true })
    script.addEventListener('error', reject, { once: true })
    document.body.appendChild(script)
  })
}

async function getSandboxOptions() {
  const response = await fetch(SANDBOX_ENDPOINT)
  if (!response.ok) throw new Error(`Freemius sandbox endpoint failed: ${response.status}`)
  return response.json()
}

export default function useFreemiusCheckout({ sandboxMode = false } = {}) {
  useEffect(() => {
    const handleCheckoutClick = async (event) => {
      const trigger = event.target.closest('[data-freemius-checkout]')
      if (!trigger) return

      event.preventDefault()

      try {
        const { freemiusProductId, freemiusPlanId, freemiusPublicKey } = trigger.dataset
        if (!freemiusProductId || !freemiusPlanId || !freemiusPublicKey) {
          throw new Error('Invalid Freemius product or plan configuration.')
        }

        await loadFreemiusCheckout()

        if (!window.FS?.Checkout) {
          throw new Error('Freemius checkout could not be opened.')
        }

        const licenses = document.getElementById('freemius-test-licenses')?.value || '1'
        const handler = new window.FS.Checkout({
          product_id: freemiusProductId,
          plan_id: freemiusPlanId,
          public_key: freemiusPublicKey,
        })

        const isFreeTrial = trigger.dataset.freemiusTrial === 'free'

        const checkoutOptions = {
          name: trigger.dataset.freemiusName || 'Blackroom Plugin',
          licenses,
          success: (response) => {
            const trialEndsAt = response?.trial?.trial_ends_at || null
            try {
              sessionStorage.setItem(CHECKOUT_RESULT_KEY, JSON.stringify({
                type: response?.trial ? 'trial' : 'purchase',
                trialEndsAt,
              }))
            } finally {
              window.location.assign('/order-success')
            }
          },
        }

        // Freemius determines the duration and payment requirement from the selected plan.
        // `free` explicitly requests its no-payment-method trial checkout.
        if (isFreeTrial) checkoutOptions.trial = 'free'
        if (sandboxMode) checkoutOptions.sandbox = await getSandboxOptions()
        await handler.open(checkoutOptions)
      } catch (error) {
        console.error(error)
        const message = error instanceof Error ? error.message : ''
        alert(message.startsWith('Invalid Freemius')
          ? 'Invalid product or plan ID. Please contact support.'
          : sandboxMode
            ? 'Freemius sandbox checkout could not be opened. Please try again shortly.'
            : 'Freemius checkout could not be opened. Please try again shortly.')
      }
    }

    document.addEventListener('click', handleCheckoutClick)
    return () => document.removeEventListener('click', handleCheckoutClick)
  }, [sandboxMode])
}
