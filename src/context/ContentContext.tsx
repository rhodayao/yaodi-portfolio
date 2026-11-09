import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { SiteContent } from '../types'
import { seedContent } from '../data/seed'
import { fetchPublicContent } from '../lib/api'

type ContentState = {
  content: SiteContent
  loading: boolean
  live: boolean
  error: string
  refresh: () => Promise<void>
}

const ContentContext = createContext<ContentState | null>(null)

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(seedContent)
  const [loading, setLoading] = useState(true)
  const [live, setLive] = useState(false)
  const [error, setError] = useState('')

  async function refresh() {
    try {
      const next = await fetchPublicContent()
      setContent(next)
      setLive(true)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '内容加载失败')
      setLive(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const value = useMemo(
    () => ({ content, loading, live, error, refresh }),
    [content, loading, live, error],
  )

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useContent() {
  const value = useContext(ContentContext)
  if (!value) throw new Error('useContent must be used inside ContentProvider')
  return value
}
