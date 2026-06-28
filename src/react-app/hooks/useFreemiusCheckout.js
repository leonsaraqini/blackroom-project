import { useEffect } from 'react'

const CHECKOUT_SCRIPT_ID = 'freemius-checkout-script'
const CHECKOUT_SCRIPT_SRC = 'https://checkout.freemius.com/js/v1/'
const SANDBOX_ENDPOINT = '/api/freemius/sandbox'

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

export default function useFreemiusCheckout() {
  useEffect(() => {
    const handleCheckoutClick = async (event) => {
      const trigger = event.target.closest('[data-freemius-checkout]')
      if (!trigger) return

      event.preventDefault()

      try {
        await loadFreemiusCheckout()

        const sandbox = await getSandboxOptions()
        const licenses = document.getElementById('freemius-test-licenses')?.value || '1'
        const handler = new window.FS.Checkout({
          product_id: trigger.dataset.freemiusProductId,
          plan_id: trigger.dataset.freemiusPlanId,
          public_key: trigger.dataset.freemiusPublicKey,
          image: trigger.dataset.freemiusImage || `${window.location.origin}/img/blackroom/favicon.png`,
        })

        handler.open({
          sandbox,
          name: trigger.dataset.freemiusName || 'Blackroom Plugin',
          licenses,
          purchaseCompleted: (response) => {
            console.log('Freemius purchase completed:', response)
            console.log('User email:', response?.user?.email)
            console.log('License key:', response?.license?.key)
          },
          success: (response) => {
            console.log('Freemius checkout closed after successful purchase:', response)
            console.log('User email:', response?.user?.email)
            console.log('License key:', response?.license?.key)
          },
        })
      } catch (error) {
        console.error(error)
        alert('Freemius sandbox checkout is not ready yet. Add the /api/freemius/sandbox backend endpoint first.')
      }
    }

    document.addEventListener('click', handleCheckoutClick)
    return () => document.removeEventListener('click', handleCheckoutClick)
  }, [])
}
