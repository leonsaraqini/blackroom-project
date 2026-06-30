import ContactPage from './pages/ContactPage.jsx'
import DuravoPage from './pages/DuravoPage.jsx'
import HomePage from './pages/HomePage.jsx'
import OrderSuccessPage from './pages/OrderSuccessPage.jsx'
import PekonPage from './pages/PekonPage.jsx'
import PerlastonePage from './pages/PerlastonePage.jsx'
import PortfolioPage from './pages/PortfolioPage.jsx'
import PositanoPage from './pages/PositanoPage.jsx'
import RavePage from './pages/RavePage.jsx'
import ServicesPage from './pages/ServicesPage.jsx'
import ShopPage from './pages/ShopPage.jsx'
import ShopTestPage from './pages/ShopTestPage.jsx'
import TrokoPage from './pages/TrokoPage.jsx'
import WiegeparadiesPage from './pages/WiegeparadiesPage.jsx'

const routes = {
  '/': HomePage,
  '/index': HomePage,
  '/portfolio': PortfolioPage,
  '/services': ServicesPage,
  '/contact': ContactPage,
  '/shop': ShopPage,
  '/shop-test': ShopTestPage,
  '/order-success': OrderSuccessPage,
  '/perlastone': PerlastonePage,
  '/duravo': DuravoPage,
  '/troko': TrokoPage,
  '/rave': RavePage,
  '/pekon': PekonPage,
  '/positano': PositanoPage,
  '/wiegeparadies': WiegeparadiesPage,
}

function normalisePath(pathname) {
  const clean = pathname.replace(/\/+$/, '') || '/'
  return clean.replace(/\.html$/, '')
}

export default function App() {
  const Page = routes[normalisePath(window.location.pathname)] || HomePage
  return <Page />
}
