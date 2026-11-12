import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../hooks/useSite'
import { useInView } from '../hooks/useInView'

type CountUpProps = {
  value: number
  suffix?: string
  pad?: boolean
  className?: string
}

export function CountUp({ value, suffix = '', pad = true, className = '' }: CountUpProps) {
  const { ref, inView } = useInView<HTMLSpanElement>()
  const [display, setDisplay] = useState(0)
  const reduced = useReducedMotion()
  const frame = useRef(0)

  useEffect(() => {
    if (!inView) return
    if (reduced) {
      setDisplay(value)
      return
    }
    const start = performance.now()
    const duration = 1300
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 4)
      setDisplay(Math.round(value * eased))
      if (progress < 1) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [inView, reduced, value])

  const formatted = pad && value < 100 ? String(display).padStart(2, '0') : String(display)

  return (
    <span ref={ref} className={`countup ${className}`}>
      {formatted}
      {suffix ? <em>{suffix}</em> : null}
    </span>
  )
}
