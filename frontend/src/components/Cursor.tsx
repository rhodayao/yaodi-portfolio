import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../hooks/useSite'

export function Cursor() {
  const dotRef = useRef<HTMLDivElement | null>(null)
  const ringRef = useRef<HTMLDivElement | null>(null)
  const [enabled, setEnabled] = useState(false)
  const [label, setLabel] = useState('')
  const [active, setActive] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches
    if (!finePointer) return
    setEnabled(true)
    document.body.classList.add('custom-cursor-enabled')

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const ring = { x: target.x, y: target.y }
    let frame = 0

    const render = () => {
      ring.x += (target.x - ring.x) * (reduced ? 1 : 0.16)
      ring.y += (target.y - ring.y) * (reduced ? 1 : 0.16)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`
      }
      frame = requestAnimationFrame(render)
    }

    const onMove = (event: PointerEvent) => {
      target.x = event.clientX
      target.y = event.clientY
      const element = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        'a, button, [data-cursor], input, textarea, select, label',
      )
      if (!element) {
        setActive(false)
        setLabel('')
        return
      }
      const cursorLabel = element.dataset.cursor || ''
      setActive(true)
      setLabel(cursorLabel)
    }

    const onLeave = () => {
      if (dotRef.current) dotRef.current.style.opacity = '0'
      if (ringRef.current) ringRef.current.style.opacity = '0'
    }
    const onEnter = () => {
      if (dotRef.current) dotRef.current.style.opacity = '1'
      if (ringRef.current) ringRef.current.style.opacity = '1'
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    document.documentElement.addEventListener('mouseenter', onEnter)
    frame = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.documentElement.removeEventListener('mouseenter', onEnter)
      document.body.classList.remove('custom-cursor-enabled')
    }
  }, [reduced])

  if (!enabled) return null

  return (
    <div className="cursor-layer" aria-hidden="true">
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className={`cursor-ring ${active ? 'is-active' : ''} ${label ? 'has-label' : ''}`}>
        <span>{label}</span>
      </div>
    </div>
  )
}
