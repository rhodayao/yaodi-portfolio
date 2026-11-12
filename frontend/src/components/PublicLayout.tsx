import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { Cursor } from '../components/Cursor'
import { Preloader } from '../components/Preloader'
import { ScrollProgress } from '../components/ScrollProgress'

function ScrollManager() {
  const location = useLocation()
  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null
    if (!state?.scrollTo) window.scrollTo(0, 0)
  }, [location.pathname, location.state])
  return null
}

export function PublicLayout() {
  const location = useLocation()

  return (
    <div className="public-site">
      <a className="skip-link" href="#main">
        跳到主要内容
      </a>
      <Cursor />
      <Preloader />
      <ScrollProgress />
      <Header />
      <main id="main" className="public-main">
        <div className="route-page" key={location.pathname}>
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  )
}
