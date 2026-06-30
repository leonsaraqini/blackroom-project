import sandboxSource from '../legacy-pages/shop-test.html?raw'
import LegacyRoutePage from '../components/LegacyRoutePage.jsx'
import useFreemiusCheckout from '../hooks/useFreemiusCheckout.js'

const replacements = [
  ['Kairos Express · Sandbox checkout', 'Kairos Express · Secure checkout'],
  ['Test the Kairos Express purchase flow for', 'Get Kairos Express and unlock'],
  ['Each button opens a Freemius sandbox checkout. No real payment will be taken while testing this page.', 'Payments are processed securely by Freemius. Choose the plan that fits your workflow.'],
  ['Test Standard', 'Buy Standard'],
  ['Test Premium', 'Buy Premium'],
  ['Test Business', 'Buy Business'],
  ['Ready to test Kairos Express?', 'Ready to use Kairos Express?'],
  ['Choose a plan and complete a sandbox purchase to verify the full Freemius checkout and licensing flow.', 'Choose a plan to receive your license key and download links immediately after checkout.'],
  ['Choose a test plan', 'Choose a plan'],
]

const source = replacements.reduce(
  (html, [search, replacement]) => html.replace(search, replacement),
  sandboxSource,
)

export default function ShopPage() {
  useFreemiusCheckout()

  return <LegacyRoutePage source={source} pathname="/shop" title="Blackroom - Shop" />
}
