import { useEffect, useRef, type PointerEvent, type ReactNode } from 'react'
import { useReducedMotion } from '../hooks/useSite'

type MagneticProps = {
  children: ReactNode
  className?: string
  strength?: number
}

export function Magnetic({ children, className = '', strength = 0.2 }: MagneticProps) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const reduced = useReducedMotion()

  function handleMove(event: PointerEvent<HTMLSpanElement>) {
    if (reduced || event.pointerType !== 'mouse') return
    const node = ref.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    const x = (event.clientX - rect.left - rect.width / 2) * strength
    const y = (event.clientY - rect.top - rect.height / 2) * strength
    node.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`
  }

  function reset() {
    if (ref.current) ref.current.style.transform = 'translate3d(0,0,0)'
  }

  useEffect(() => {
    if (reduced) reset()
  }, [reduced])

  return (
    <span
      ref={ref}
      className={`magnetic ${className}`}
      onPointerMove={handleMove}
      onPointerLeave={reset}
    >
      {children}
    </span>
  )
}
