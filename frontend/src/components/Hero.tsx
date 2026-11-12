import { useRef, type PointerEvent } from 'react'
import { useContent } from '../context/ContentContext'
import { useReducedMotion } from '../hooks/useSite'
import { ArrowDown, ArrowUpRight } from './Icons'
import { CountUp } from './CountUp'
import { Magnetic } from './Magnetic'

export function Hero() {
  const { content } = useContent()
  const { site } = content
  const heroRef = useRef<HTMLElement | null>(null)
  const reduced = useReducedMotion()

  function handleMove(event: PointerEvent<HTMLElement>) {
    if (reduced || event.pointerType !== 'mouse') return
    const node = heroRef.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const y = ((event.clientY - rect.top) / rect.height) * 2 - 1
    node.style.setProperty('--hero-px', x.toFixed(3))
    node.style.setProperty('--hero-py', y.toFixed(3))
  }

  function reset() {
    const node = heroRef.current
    if (!node) return
    node.style.setProperty('--hero-px', '0')
    node.style.setProperty('--hero-py', '0')
  }

  return (
    <section
      ref={heroRef}
      className="hero"
      id="top"
      aria-labelledby="hero-heading"
      onPointerMove={handleMove}
      onPointerLeave={reset}
    >
      <div className="hero-backdrop" aria-hidden="true">
        <div className="hero-grid" />
        <div className="hero-glow hero-glow--one" />
        <div className="hero-glow hero-glow--two" />
        <div className="hero-scan" />
        <div className="hero-triangles">
          {Array.from({ length: 12 }).map((_, index) => (
            <span key={index} style={{ ['--i' as string]: index }} />
          ))}
        </div>
        <span className="hero-cross hero-cross--a" />
        <span className="hero-cross hero-cross--b" />
        <span className="hero-cross hero-cross--c" />
        <span className="hero-coord">30.5928° N / 114.3055° E</span>
      </div>

      <div className="hero-content">
        <div className="hero-kicker">
          <span className="lime-dot" />
          <span>{site.hero.kicker}</span>
          <span className="rule" />
          <span className="hero-edition">EDITION 04</span>
        </div>

        <h1 id="hero-heading" className="hero-title" aria-label={site.hero.heading}>
          <span aria-hidden="true" className="hero-title-inner">
            {'PORTFOLI'.split('').map((letter, index) => (
              <span key={`${letter}-${index}`} className={`hero-char ${index === 1 ? 'is-lime' : ''}`}>
                {letter}
              </span>
            ))}
            <span className="hero-orb">
              <span className="sr-only">O</span>
            </span>
          </span>
        </h1>

        <div className="hero-sub">
          <div className="hero-identity">
            <span className="micro-label">UI/UX DESIGNER · WUHAN</span>
            <p className="hero-name">
              {site.name}
              <span>{site.nameEn}</span>
            </p>
            <p className="hero-role">
              {site.title} <i /> {site.years} 年经验
            </p>
          </div>

          <div className="hero-statement">
            <p className="hero-tagline">{site.tagline}</p>
            <p className="hero-intro">{site.intro}</p>
            <div className="hero-actions">
              <Magnetic strength={0.16}>
                <a className="pill-button" href="#work" data-cursor="VIEW">
                  <span>{site.hero.primaryCta}</span>
                  <span className="pill-icon">
                    <ArrowDown size={17} />
                  </span>
                </a>
              </Magnetic>
              <a className="text-link" href="#about" data-cursor="ABOUT">
                {site.hero.secondaryCta}
                <ArrowUpRight size={15} />
              </a>
            </div>
          </div>
        </div>

        <div className="hero-stats" role="list">
          {site.stats.map((stat, index) => (
            <div className="hero-stat" role="listitem" key={stat.label}>
              <div className="hero-stat-top">
                <span className="hero-stat-index">0{index + 1}</span>
                <span className="hero-stat-note">{stat.note}</span>
              </div>
              <CountUp value={stat.value} suffix={stat.suffix} className="hero-stat-value" />
              <span className="hero-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="hero-bottom" aria-hidden="true">
        <span className="hero-scroll">
          <i />
          SCROLL TO EXPLORE
        </span>
        <span className="hero-bottom-line" />
        <span>SELECTED WORKS / 05</span>
      </div>
    </section>
  )
}
