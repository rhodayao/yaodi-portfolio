import { useEffect, useState } from 'react'
import { useReducedMotion } from '../hooks/useSite'

export function Preloader() {
  const reduced = useReducedMotion()
  const [visible, setVisible] = useState(true)
  const [leaving, setLeaving] = useState(false)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const seen = sessionStorage.getItem('yd_intro_seen')
    if (seen || reduced) {
      setVisible(false)
      sessionStorage.setItem('yd_intro_seen', '1')
      return
    }

    document.body.classList.add('is-loading')
    const started = performance.now()
    const duration = 1250
    let frame = 0

    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * 100))
      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        setLeaving(true)
        sessionStorage.setItem('yd_intro_seen', '1')
        window.setTimeout(() => {
          setVisible(false)
          document.body.classList.remove('is-loading')
        }, 700)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      document.body.classList.remove('is-loading')
    }
  }, [reduced])

  if (!visible) return null

  return (
    <div className={`preloader ${leaving ? 'is-leaving' : ''}`} aria-hidden="true">
      <div className="preloader-grid" />
      <div className="preloader-meta">
        <span>YAO DI / PORTFOLIO</span>
        <span>WUHAN · 2026</span>
      </div>
      <div className="preloader-center">
        <span className="preloader-mark">YD</span>
        <span className="preloader-count">{String(count).padStart(3, '0')}</span>
      </div>
      <div className="preloader-bar">
        <span style={{ transform: `scaleX(${count / 100})` }} />
      </div>
      <div className="preloader-foot">
        <span>LOADING SELECTED WORKS</span>
        <span>UI/UX · AI · DATA</span>
      </div>
    </div>
  )
}
