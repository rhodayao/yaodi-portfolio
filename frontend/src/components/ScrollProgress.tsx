import { useScrollProgress } from '../hooks/useSite'

export function ScrollProgress() {
  const progress = useScrollProgress()
  return (
    <div className="scroll-progress" aria-hidden="true">
      <span style={{ transform: `scaleX(${progress})` }} />
    </div>
  )
}
