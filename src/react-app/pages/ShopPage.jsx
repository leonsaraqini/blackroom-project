import shopTemplate from '../legacy-pages/shop-test.html?raw'
import LegacyRoutePage from '../components/LegacyRoutePage.jsx'
import useFreemiusCheckout from '../hooks/useFreemiusCheckout.js'

const replacements = [
  ['Kairos Express · Sandbox checkout', 'Kairos Express for After Effects'],
  ['Test the Kairos Express purchase flow for its searchable After Effects expression library, live previews, custom tools and team features.', 'Find, preview and apply the right After Effects expression in seconds. Choose the toolkit that fits your workflow.'],
  ['Each button opens a Freemius sandbox checkout. No real payment will be taken while testing this page.', 'Choose a plan below. Payments are securely processed by Freemius, and your license key and download link are delivered by email.'],
  ['Test Standard', 'Get Standard'],
  ['Test Premium', 'Get Premium'],
  ['Test Business', 'Get Business'],
  ['Ready to test Kairos Express?', 'Ready to create faster?'],
  ['Choose a plan and complete a sandbox purchase to verify the full Freemius checkout and licensing flow.', 'Choose your Kairos Express plan and start building animations with a faster, more organized expression workflow.'],
  ['Choose a test plan', 'Get Kairos Express'],
]

const source = replacements.reduce(
  (html, [search, replacement]) => html.replace(search, replacement),
  shopTemplate,
)

export default function ShopPage() {
  useFreemiusCheckout()

  return <LegacyRoutePage source={source} pathname="/shop" title="Blackroom - Shop" />
}
