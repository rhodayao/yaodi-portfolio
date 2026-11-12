import { useEffect, useState } from 'react'

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  )

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return reduced
}

export function useReveal(ready = true) {
  useEffect(() => {
    if (!ready) return
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (!elements.length) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach((el) => el.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    )

    elements.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
        el.classList.add('is-visible')
      } else {
        observer.observe(el)
      }
    })

    return () => observer.disconnect()
  }, [ready])
}

export function useLocalTime(timeZone = 'Asia/Shanghai') {
  const [time, setTime] = useState(() => formatTime(timeZone))
  useEffect(() => {
    const timer = window.setInterval(() => setTime(formatTime(timeZone)), 30_000)
    return () => window.clearInterval(timer)
  }, [timeZone])
  return time
}

function formatTime(timeZone: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
  }).format(new Date())
}

export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    const previous = document.title
    document.title = title
    let meta: HTMLMetaElement | null = null
    if (description) {
      meta = document.querySelector('meta[name="description"]')
      if (meta) meta.setAttribute('content', description)
    }
    return () => {
      document.title = previous
    }
  }, [title, description])
}

export function useScrollProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    let frame = 0
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0)
    }
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
  return progress
}
