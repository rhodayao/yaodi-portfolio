import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import { useLocalTime, useReducedMotion } from '../hooks/useSite'
import { Close, Menu, ArrowUpRight } from './Icons'

const NAV = [
  { id: 'about', label: '关于', en: 'ABOUT' },
  { id: 'experience', label: '经历', en: 'EXPERIENCE' },
  { id: 'work', label: '作品', en: 'WORK' },
  { id: 'contact', label: '联系', en: 'CONTACT' },
]

export function Header() {
  const { content } = useContent()
  const { site, contact } = content
  const location = useLocation()
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const time = useLocalTime()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [active, setActive] = useState('')
  const menuButtonRef = useRef<HTMLButtonElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    let lastY = window.scrollY
    let frame = 0
    let idleTimer = 0
    const update = () => {
      const y = window.scrollY
      setScrolled(y > 24)
      if (!menuOpen) {
        if (y > 560 && y > lastY + 8) {
          setHidden(true)
          window.clearTimeout(idleTimer)
          idleTimer = window.setTimeout(() => setHidden(false), 520)
        } else if (y < lastY - 6 || y < 120) {
          window.clearTimeout(idleTimer)
          setHidden(false)
        }
      }
      lastY = y
      if (location.pathname === '/') {
        const probe = y + window.innerHeight * 0.32
        let current = ''
        for (const item of NAV) {
          const node = document.getElementById(item.id)
          if (node && node.offsetTop <= probe) current = item.id
        }
        setActive(current)
      } else if (location.pathname.startsWith('/work/')) {
        setActive('work')
      } else {
        setActive('')
      }
    }
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(idleTimer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [location.pathname, menuOpen])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  function goToSection(id: string) {
    setMenuOpen(false)
    if (location.pathname === '/') {
      const node = document.getElementById(id)
      node?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
      window.history.replaceState(null, '', `/#${id}`)
      return
    }
    navigate('/', { state: { scrollTo: id } })
  }

  function goHome() {
    setMenuOpen(false)
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
      window.history.replaceState(null, '', '/')
    } else {
      navigate('/')
    }
  }

  const headerClass = [
    'site-header',
    scrolled ? 'is-solid' : '',
    hidden ? 'is-hidden' : '',
    menuOpen ? 'is-menu-open' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <header className={headerClass}>
        <div className="header-inner">
          <button className="brand" type="button" onClick={goHome} aria-label="返回首页">
            <span className="brand-mark">YD</span>
            <span className="brand-copy">
              <strong>{site.name}</strong>
              <small>UI/UX DESIGNER</small>
            </span>
          </button>

          <nav className="desktop-nav" aria-label="主导航">
            {NAV.map((item, index) => (
              <a
                key={item.id}
                href={`/#${item.id}`}
                className={active === item.id ? 'is-active' : ''}
                onClick={(event) => {
                  event.preventDefault()
                  goToSection(item.id)
                }}
              >
                <span className="nav-number">0{index + 1}</span>
                <span className="nav-label">{item.label}</span>
                <span className="nav-en">{item.en}</span>
              </a>
            ))}
          </nav>

          <div className="header-actions">
            <span className="availability">
              <i />
              {site.status}
            </span>
            <span className="header-clock">
              WUHAN <b>{time}</b>
            </span>
            <button
              ref={menuButtonRef}
              className="menu-toggle"
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="打开菜单"
              aria-expanded={menuOpen}
            >
              <span>MENU</span>
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      <div
        className={`nav-overlay ${menuOpen ? 'is-open' : ''}`}
        aria-hidden={!menuOpen}
        role="dialog"
        aria-modal="true"
        aria-label="导航菜单"
      >
        <div className="overlay-grid" />
        <div className="overlay-top">
          <span className="overlay-brand">YD® / {site.nameEn}</span>
          <button
            ref={closeButtonRef}
            type="button"
            className="overlay-close"
            onClick={() => {
              setMenuOpen(false)
              menuButtonRef.current?.focus()
            }}
            aria-label="关闭菜单"
          >
            <span>CLOSE</span>
            <Close size={20} />
          </button>
        </div>
        <nav className="overlay-nav" aria-label="移动端导航">
          {NAV.map((item, index) => (
            <a
              key={item.id}
              href={`/#${item.id}`}
              className="overlay-link"
              onClick={(event) => {
                event.preventDefault()
                goToSection(item.id)
              }}
              tabIndex={menuOpen ? 0 : -1}
            >
              <span className="overlay-index">0{index + 1}</span>
              <span className="overlay-label">{item.label}</span>
              <span className="overlay-en">{item.en}</span>
              <ArrowUpRight size={28} />
            </a>
          ))}
        </nav>
        <div className="overlay-foot">
          <div>
            <span className="micro-label">EMAIL</span>
            <a href={`mailto:${site.email}`} tabIndex={menuOpen ? 0 : -1}>
              {site.email}
            </a>
          </div>
          <div>
            <span className="micro-label">LOCATION</span>
            <span>{site.location}</span>
          </div>
          <div>
            <span className="micro-label">STATUS</span>
            <span className="overlay-status">
              <i /> {site.availability}
            </span>
          </div>
        </div>
        <div className="overlay-bottom">
          <span>{contact.copyright}</span>
          <span>WUHAN · {time}</span>
        </div>
      </div>
    </>
  )
}
