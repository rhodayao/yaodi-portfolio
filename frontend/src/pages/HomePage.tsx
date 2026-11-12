import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import { usePageMeta, useReveal } from '../hooks/useSite'
import { Hero } from '../components/Hero'
import { WorkIndex } from '../components/WorkIndex'
import { AboutSection } from '../components/AboutSection'
import { ExperienceSection } from '../components/ExperienceSection'
import { ContactSection } from '../components/ContactSection'

const STRIP = [
  'AI PRODUCT',
  'DESIGN SYSTEM',
  'DATA VISUALIZATION',
  'B/G END',
  'MOBILE EXPERIENCE',
  'FINANCE AI',
]

export function HomePage() {
  const { content } = useContent()
  const location = useLocation()
  useReveal(true)
  usePageMeta(
    `${content.site.name} · ${content.site.title}作品集`,
    `${content.site.tagline} ${content.site.intro}`,
  )

  useEffect(() => {
    const target =
      (location.state as { scrollTo?: string } | null)?.scrollTo || location.hash.replace('#', '')
    if (!target) return
    const timer = window.setTimeout(() => {
      const node = document.getElementById(target)
      if (node) {
        node.scrollIntoView({ behavior: 'auto', block: 'start' })
        window.history.replaceState(null, '', `/#${target}`)
      }
    }, 80)
    return () => window.clearTimeout(timer)
  }, [location.state, location.hash])

  return (
    <div className="home-page">
      <Hero />
      <AboutSection />
      <ExperienceSection />
      <div className="capability-strip" aria-hidden="true">
        <div className="capability-track">
          {[...STRIP, ...STRIP].map((item, index) => (
            <span key={`${item}-${index}`}>
              {item}
              <i>+</i>
            </span>
          ))}
        </div>
      </div>
      <WorkIndex />
      <ContactSection />
    </div>
  )
}
