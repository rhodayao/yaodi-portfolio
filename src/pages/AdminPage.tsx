import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type {
  Experience,
  GalleryItem,
  Metric,
  Principle,
  Project,
  ProjectSection,
  SiteContent,
  SkillGroup,
  Stat,
} from '../types'
import {
  ApiError,
  clearToken,
  fetchAdminContent,
  getToken,
  login,
  saveContent,
  uploadImage,
} from '../lib/api'
import { usePageMeta } from '../hooks/useSite'
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  Close,
  Eye,
  LogOut,
  Plus,
  Save,
  Trash,
  Upload,
} from '../components/Icons'

type TabId = 'overview' | 'site' | 'about' | 'experience' | 'projects' | 'skills' | 'contact'
type Update = (recipe: (draft: SiteContent) => void) => void
type Toast = { type: 'ok' | 'error'; message: string }

const TABS: { id: TabId; label: string; en: string }[] = [
  { id: 'overview', label: '概览', en: 'OVERVIEW' },
  { id: 'site', label: '基本信息', en: 'SITE' },
  { id: 'about', label: '关于我', en: 'ABOUT' },
  { id: 'experience', label: '工作经历', en: 'EXPERIENCE' },
  { id: 'projects', label: '作品管理', en: 'PROJECTS' },
  { id: 'skills', label: '能力标签', en: 'SKILLS' },
  { id: 'contact', label: '联系与页脚', en: 'CONTACT' },
]

export function AdminPage() {
  usePageMeta('内容管理 · 姚迪作品集')
  useEffect(() => {
    document.body.classList.add('admin-mode')
    return () => document.body.classList.remove('admin-mode')
  }, [])
  const [token, setToken] = useState(getToken())
  const [content, setContent] = useState<SiteContent | null>(null)
  const [loading, setLoading] = useState(Boolean(token))
  const [loadError, setLoadError] = useState('')
  const [tab, setTab] = useState<TabId>('overview')
  const [selectedSlug, setSelectedSlug] = useState('')
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const toastTimer = useRef<number | null>(null)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    fetchAdminContent()
      .then((data) => {
        if (cancelled) return
        setContent(data)
        setSelectedSlug(data.projects[0]?.slug || '')
        setLoadError('')
      })
      .catch((error) => {
        if (cancelled) return
        if (error instanceof ApiError && error.status === 401) {
          clearToken()
          setToken('')
        } else {
          setLoadError(error instanceof Error ? error.message : '加载失败')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  useEffect(() => {
    if (!dirty) return
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  function notify(message: string, type: 'ok' | 'error' = 'ok') {
    setToast({ type, message })
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3200)
  }

  const update: Update = (recipe) => {
    setContent((current) => {
      if (!current) return current
      const next = structuredClone(current)
      recipe(next)
      return next
    })
    setDirty(true)
  }

  async function handleSave() {
    if (!content || saving) return
    setSaving(true)
    try {
      const result = await saveContent(content)
      setContent((current) => (current ? { ...current, updatedAt: result.updatedAt } : current))
      setDirty(false)
      notify('已保存并发布到网站')
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearToken()
        setToken('')
        return
      }
      notify(error instanceof Error ? error.message : '保存失败', 'error')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        void handleSave()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  function logout() {
    clearToken()
    setToken('')
    setContent(null)
  }

  if (!token) {
    return <AdminLogin onSuccess={(nextToken) => setToken(nextToken)} />
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <span className="admin-loader-mark">YD</span>
        <span>LOADING CONTENT STUDIO…</span>
      </div>
    )
  }

  if (!content || loadError) {
    return (
      <div className="admin-loading">
        <span className="admin-loader-mark">!</span>
        <span>{loadError || '内容加载失败'}</span>
        <div className="admin-loading-actions">
          <button type="button" onClick={() => setToken('')}>
            返回登录
          </button>
          <Link to="/">查看网站</Link>
        </div>
      </div>
    )
  }

  const selectedProject =
    content.projects.find((project) => project.slug === selectedSlug) || content.projects[0]

  return (
    <div className="admin-site">
      <header className="admin-header">
        <Link to="/admin" className="admin-brand" onClick={() => setTab('overview')}>
          <span className="admin-brand-mark">YD</span>
          <span className="admin-brand-copy">
            姚迪作品集
            <small>内容管理平台</small>
          </span>
        </Link>
        <div className="admin-header-status">
          <span className={`admin-save-state ${dirty ? 'is-dirty' : ''}`}>
            <i />
            {dirty ? '有未保存的更改' : '所有更改已保存'}
          </span>
        </div>
        <div className="admin-header-actions">
          <Link to="/" target="_blank" rel="noreferrer" className="admin-ghost-button">
            <Eye size={15} />
            <span>查看网站</span>
          </Link>
          <button
            type="button"
            className="admin-save-button"
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={15} />
            {saving ? '保存中…' : '保存并发布'}
          </button>
          <button type="button" className="admin-icon-button" onClick={logout} aria-label="退出登录">
            <LogOut size={17} />
          </button>
        </div>
      </header>

      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-side-label">CONTENT</div>
          <nav aria-label="后台导航">
            {TABS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={tab === item.id ? 'is-active' : ''}
                onClick={() => setTab(item.id)}
              >
                <span className="admin-nav-no">0{index + 1}</span>
                <span>{item.label}</span>
                <small>{item.en}</small>
              </button>
            ))}
          </nav>
          <div className="admin-side-meta">
            <span className="admin-side-label">LAST PUBLISHED</span>
            <span>{formatDate(content.updatedAt)}</span>
            <span className="admin-side-hint">保存后立即生效，网站无需重启。</span>
          </div>
          <div className="admin-side-tip">
            <span>⌘ S</span>
            快速保存
          </div>
        </aside>

        <main className="admin-main">
          <div className="admin-page-head">
            <div>
              <span className="admin-eyebrow">
                {TABS.find((item) => item.id === tab)?.en} / 编辑
              </span>
              <h1>{TABS.find((item) => item.id === tab)?.label}</h1>
            </div>
            <span className="admin-api-state">
              <i /> API CONNECTED
            </span>
          </div>

          {tab === 'overview' ? (
            <OverviewTab content={content} onTab={setTab} onSave={handleSave} saving={saving} />
          ) : null}
          {tab === 'site' ? <SiteTab content={content} update={update} /> : null}
          {tab === 'about' ? (
            <AboutTab content={content} update={update} notify={notify} />
          ) : null}
          {tab === 'experience' ? <ExperienceTab content={content} update={update} /> : null}
          {tab === 'projects' ? (
            <ProjectsTab
              content={content}
              update={update}
              selectedSlug={selectedProject?.slug || ''}
              setSelectedSlug={setSelectedSlug}
              notify={notify}
            />
          ) : null}
          {tab === 'skills' ? <SkillsTab content={content} update={update} /> : null}
          {tab === 'contact' ? <ContactTab content={content} update={update} /> : null}
        </main>
      </div>

      {toast ? (
        <div className={`admin-toast is-${toast.type}`}>
          {toast.type === 'ok' ? <Check size={15} /> : <Close size={15} />}
          {toast.message}
        </div>
      ) : null}
    </div>
  )
}

/* --------------------------------------------------------
   Login
   -------------------------------------------------------- */

function AdminLogin({ onSuccess }: { onSuccess: (token: string) => void }) {
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!password || busy) return
    setBusy(true)
    setError('')
    try {
      const result = await login(password)
      sessionStorage.setItem('yd_admin_token', result.token)
      onSuccess(result.token)
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败')
      setBusy(false)
    }
  }

  return (
    <div className="adm-login-page">
      <div className="adm-login-card">
        <div className="adm-login-brand">
          <span className="adm-login-mark">YD</span>
          <span>
            姚迪作品集
            <small>内容管理平台</small>
          </span>
        </div>

        <div className="adm-login-heading">
          <span>ADMIN CONSOLE</span>
          <h1>登录后台</h1>
          <p>更新作品、经历和网站文案。</p>
        </div>

        <form onSubmit={submit} className="adm-login-form">
          <label htmlFor="admin-password">管理密码</label>
          <div className="adm-password-field">
            <input
              id="admin-password"
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="请输入管理密码"
              autoFocus
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShow((value) => !value)}
              aria-label={show ? '隐藏密码' : '显示密码'}
            >
              <Eye size={16} />
            </button>
          </div>
          {error ? <p className="adm-form-error">{error}</p> : null}
          <button type="submit" className="adm-login-submit" disabled={busy || !password}>
            {busy ? '验证中…' : '登录'}
          </button>
        </form>

        <div className="adm-login-tip">
          <span>提示</span>
          默认密码见项目 README，正式上线前请修改 `.env` 中的 ADMIN_PASSWORD。
        </div>

        <div className="adm-login-footer">
          <Link to="/">
            <ArrowLeft size={14} /> 返回网站
          </Link>
          <span>YAO DI · CMS</span>
        </div>
      </div>
    </div>
  )
}

/* --------------------------------------------------------
   Overview
   -------------------------------------------------------- */

function OverviewTab({
  content,
  onTab,
  onSave,
  saving,
}: {
  content: SiteContent
  onTab: (tab: TabId) => void
  onSave: () => void
  saving: boolean
}) {
  const totalCharacters = content.projects.reduce(
    (sum, project) =>
      sum +
      project.summary.length +
      project.sections.reduce((sectionSum, section) => sectionSum + section.body.length, 0),
    0,
  )
  const characterLabel =
    totalCharacters >= 1000
      ? `${(totalCharacters / 1000).toFixed(1)}k`
      : String(totalCharacters)
  return (
    <div className="admin-overview">
      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <span>PROJECTS</span>
          <strong>{String(content.projects.length).padStart(2, '0')}</strong>
          <small>已发布作品</small>
        </div>
        <div className="admin-stat-card">
          <span>EXPERIENCE</span>
          <strong>{String(content.experiences.length).padStart(2, '0')}</strong>
          <small>段工作经历</small>
        </div>
        <div className="admin-stat-card">
          <span>WORDS</span>
          <strong>{characterLabel}</strong>
          <small>项目内容字数</small>
        </div>
        <div className="admin-stat-card is-accent">
          <span>LAST SAVE</span>
          <strong>{formatDateShort(content.updatedAt)}</strong>
          <small>{formatDate(content.updatedAt)}</small>
        </div>
      </div>

      <div className="admin-overview-grid">
        <section className="admin-card admin-card--wide">
          <div className="admin-card-head">
            <div>
              <span className="admin-eyebrow">QUICK START</span>
              <h2>这份内容会出现在哪里</h2>
            </div>
            <span className="admin-card-note">编辑 → 保存 → 前台即时更新</span>
          </div>
          <div className="admin-map">
            {[
              ['site', '基本信息', '首屏标题、姓名、简介、数据指标'],
              ['projects', '作品管理', '作品列表、详情页、AI 交互演示'],
              ['about', '关于我', '个人照片、自我介绍、设计原则'],
              ['experience', '工作经历', '最新工作与过往经历'],
              ['skills', '能力标签', '设计能力、产品类型、工具'],
              ['contact', '联系与页脚', '邮箱、电话、社交链接与版权'],
            ].map(([id, label, description]) => (
              <button key={id} type="button" onClick={() => onTab(id as TabId)}>
                <span>{label}</span>
                <small>{description}</small>
                <ArrowUpRight size={15} />
              </button>
            ))}
          </div>
        </section>

        <section className="admin-card">
          <div className="admin-card-head">
            <div>
              <span className="admin-eyebrow">LATEST ROLE</span>
              <h2>最新工作</h2>
            </div>
          </div>
          <div className="admin-latest-role">
            <span className="admin-live-dot" />
            <strong>{content.experiences[0]?.company}</strong>
            <span>{content.experiences[0]?.role}</span>
            <p>{content.experiences[0]?.summary}</p>
            <button type="button" onClick={() => onTab('experience')}>
              编辑这段经历 <ArrowUpRight size={14} />
            </button>
          </div>
        </section>

        <section className="admin-card">
          <div className="admin-card-head">
            <div>
              <span className="admin-eyebrow">PUBLISH</span>
              <h2>发布检查</h2>
            </div>
          </div>
          <ul className="admin-checklist">
            <li>
              <Check size={13} /> 内容已连接后台接口
            </li>
            <li>
              <Check size={13} /> 作品封面与图片可上传替换
            </li>
            <li>
              <Check size={13} /> 保存时自动生成内容备份
            </li>
            <li className="is-muted">
              <span>!</span> 正式上线前请修改默认密码
            </li>
          </ul>
          <button type="button" className="admin-primary-button" onClick={onSave} disabled={saving}>
            <Save size={15} />
            {saving ? '保存中…' : '保存并发布'}
          </button>
        </section>
      </div>
    </div>
  )
}

/* --------------------------------------------------------
   Editors
   -------------------------------------------------------- */

function SiteTab({ content, update }: { content: SiteContent; update: Update }) {
  const { site } = content
  return (
    <div className="admin-form">
      <FormSection title="基本信息" en="BASIC">
        <div className="admin-form-grid">
          <Field label="中文姓名">
            <TextInput value={site.name} onChange={(value) => update((d) => void (d.site.name = value))} />
          </Field>
          <Field label="英文姓名">
            <TextInput
              value={site.nameEn}
              onChange={(value) => update((d) => void (d.site.nameEn = value))}
            />
          </Field>
          <Field label="职位">
            <TextInput
              value={site.title}
              onChange={(value) => update((d) => void (d.site.title = value))}
            />
          </Field>
          <Field label="工作年限">
            <TextInput
              type="number"
              value={String(site.years)}
              onChange={(value) => update((d) => void (d.site.years = Number(value) || 0))}
            />
          </Field>
          <Field label="所在城市">
            <TextInput
              value={site.location}
              onChange={(value) => update((d) => void (d.site.location = value))}
            />
          </Field>
          <Field label="求职状态">
            <TextInput
              value={site.status}
              onChange={(value) => update((d) => void (d.site.status = value))}
            />
          </Field>
          <Field label="可合作方式">
            <TextInput
              value={site.availability}
              onChange={(value) => update((d) => void (d.site.availability = value))}
            />
          </Field>
          <Field label="简历链接（可留空）">
            <TextInput
              value={site.resumeUrl}
              onChange={(value) => update((d) => void (d.site.resumeUrl = value))}
              placeholder="https://…"
            />
          </Field>
          <Field label="一句话主张" wide>
            <TextInput
              value={site.tagline}
              onChange={(value) => update((d) => void (d.site.tagline = value))}
            />
          </Field>
          <Field label="首屏简介" wide>
            <TextArea
              value={site.intro}
              rows={3}
              onChange={(value) => update((d) => void (d.site.intro = value))}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="首屏文案" en="HERO">
        <div className="admin-form-grid">
          <Field label="眉标">
            <TextInput
              value={site.hero.kicker}
              onChange={(value) => update((d) => void (d.site.hero.kicker = value))}
            />
          </Field>
          <Field label="大标题（英文）">
            <TextInput
              value={site.hero.heading}
              onChange={(value) => update((d) => void (d.site.hero.heading = value))}
            />
          </Field>
          <Field label="主按钮">
            <TextInput
              value={site.hero.primaryCta}
              onChange={(value) => update((d) => void (d.site.hero.primaryCta = value))}
            />
          </Field>
          <Field label="次按钮">
            <TextInput
              value={site.hero.secondaryCta}
              onChange={(value) => update((d) => void (d.site.hero.secondaryCta = value))}
            />
          </Field>
          <Field label="首屏备注" wide>
            <TextInput
              value={site.hero.note}
              onChange={(value) => update((d) => void (d.site.hero.note = value))}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="首屏数据" en="NUMBERS">
        <div className="admin-repeat-list">
          {site.stats.map((stat, index) => (
            <div className="admin-repeat-row admin-stat-fields" key={index}>
              <TextInput
                type="number"
                value={String(stat.value)}
                onChange={(value) =>
                  update((d) => void (d.site.stats[index].value = Number(value) || 0))
                }
              />
              <TextInput
                value={stat.suffix}
                placeholder="后缀 +"
                onChange={(value) => update((d) => void (d.site.stats[index].suffix = value))}
              />
              <TextInput
                value={stat.label}
                placeholder="标签"
                onChange={(value) => update((d) => void (d.site.stats[index].label = value))}
              />
              <TextInput
                value={stat.note}
                placeholder="英文备注"
                onChange={(value) => update((d) => void (d.site.stats[index].note = value))}
              />
              <button
                type="button"
                className="admin-row-remove"
                aria-label="删除指标"
                onClick={() => update((d) => void d.site.stats.splice(index, 1))}
              >
                <Trash size={14} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="admin-add-button"
          onClick={() =>
            update((d) => {
              const item: Stat = { value: 1, suffix: '', label: '新指标', note: 'NEW' }
              d.site.stats.push(item)
            })
          }
        >
          <Plus size={14} /> 添加指标
        </button>
      </FormSection>

      <FormSection title="联系方式" en="CONTACT">
        <div className="admin-form-grid">
          <Field label="邮箱">
            <TextInput
              value={site.email}
              onChange={(value) => update((d) => void (d.site.email = value))}
            />
          </Field>
          <Field label="电话">
            <TextInput
              value={site.phone}
              onChange={(value) => update((d) => void (d.site.phone = value))}
            />
          </Field>
          <Field label="微信">
            <TextInput
              value={site.wechat}
              onChange={(value) => update((d) => void (d.site.wechat = value))}
            />
          </Field>
          <Field label="站酷主页">
            <TextInput
              value={site.zcool}
              onChange={(value) => update((d) => void (d.site.zcool = value))}
            />
          </Field>
        </div>
      </FormSection>
    </div>
  )
}

function AboutTab({
  content,
  update,
  notify,
}: {
  content: SiteContent
  update: Update
  notify: (message: string, type?: 'ok' | 'error') => void
}) {
  const { about } = content
  return (
    <div className="admin-form">
      <FormSection title="个人介绍" en="INTRO">
        <div className="admin-form-grid">
          <Field label="眉标">
            <TextInput
              value={about.eyebrow}
              onChange={(value) => update((d) => void (d.about.eyebrow = value))}
            />
          </Field>
          <Field label="标题（可换行）">
            <TextArea
              value={about.heading}
              rows={2}
              onChange={(value) => update((d) => void (d.about.heading = value))}
            />
          </Field>
          <Field label="引言" wide>
            <TextArea
              value={about.lede}
              rows={2}
              onChange={(value) => update((d) => void (d.about.lede = value))}
            />
          </Field>
        </div>

        <div className="admin-form-grid">
          <Field label="个人照片" wide>
            <ImageField
              value={about.portrait}
              onChange={(value) => update((d) => void (d.about.portrait = value))}
              notify={notify}
            />
          </Field>
          <Field label="照片替代文字">
            <TextInput
              value={about.portraitAlt}
              onChange={(value) => update((d) => void (d.about.portraitAlt = value))}
            />
          </Field>
          <Field label="照片角标">
            <TextInput
              value={about.portraitCaption}
              onChange={(value) => update((d) => void (d.about.portraitCaption = value))}
            />
          </Field>
        </div>

        <div className="admin-array-block">
          <div className="admin-array-head">
            <span>介绍段落</span>
            <button
              type="button"
              onClick={() => update((d) => void d.about.paragraphs.push('新的介绍段落'))}
            >
              <Plus size={13} /> 添加段落
            </button>
          </div>
          {about.paragraphs.map((paragraph, index) => (
            <div className="admin-repeat-row" key={index}>
              <TextArea
                value={paragraph}
                rows={3}
                onChange={(value) => update((d) => void (d.about.paragraphs[index] = value))}
              />
              <button
                type="button"
                className="admin-row-remove"
                aria-label="删除段落"
                onClick={() => update((d) => void d.about.paragraphs.splice(index, 1))}
              >
                <Trash size={14} />
              </button>
            </div>
          ))}
        </div>
      </FormSection>

      <FormSection title="当前状态" en="NOW">
        <div className="admin-form-grid">
          <Field label="标签">
            <TextInput
              value={about.now.label}
              onChange={(value) => update((d) => void (d.about.now.label = value))}
            />
          </Field>
          <Field label="公司">
            <TextInput
              value={about.now.company}
              onChange={(value) => update((d) => void (d.about.now.company = value))}
            />
          </Field>
          <Field label="职位">
            <TextInput
              value={about.now.role}
              onChange={(value) => update((d) => void (d.about.now.role = value))}
            />
          </Field>
          <Field label="描述" wide>
            <TextArea
              value={about.now.text}
              rows={3}
              onChange={(value) => update((d) => void (d.about.now.text = value))}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="设计原则" en="PRINCIPLES">
        <div className="admin-repeat-list">
          {about.principles.map((principle, index) => (
            <div className="admin-subcard" key={index}>
              <div className="admin-subcard-head">
                <span>原则 {String(index + 1).padStart(2, '0')}</span>
                <button
                  type="button"
                  onClick={() => update((d) => void d.about.principles.splice(index, 1))}
                >
                  <Trash size={13} />
                </button>
              </div>
              <div className="admin-form-grid">
                <Field label="序号">
                  <TextInput
                    value={principle.no}
                    onChange={(value) =>
                      update((d) => void (d.about.principles[index].no = value))
                    }
                  />
                </Field>
                <Field label="标题">
                  <TextInput
                    value={principle.title}
                    onChange={(value) =>
                      update((d) => void (d.about.principles[index].title = value))
                    }
                  />
                </Field>
                <Field label="说明" wide>
                  <TextArea
                    value={principle.body}
                    rows={2}
                    onChange={(value) =>
                      update((d) => void (d.about.principles[index].body = value))
                    }
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="admin-add-button"
          onClick={() =>
            update((d) => {
              const item: Principle = { no: '04', title: '新的原则', body: '说明…' }
              d.about.principles.push(item)
            })
          }
        >
          <Plus size={14} /> 添加原则
        </button>
      </FormSection>
    </div>
  )
}

function ExperienceTab({ content, update }: { content: SiteContent; update: Update }) {
  return (
    <div className="admin-form">
      <div className="admin-list-head">
        <p>按时间倒序排列，第一条会作为「最新工作」展示在首页。</p>
        <button
          type="button"
          className="admin-add-button"
          onClick={() =>
            update((d) => {
              const item: Experience = {
                company: '新公司',
                role: '职位名称',
                period: '2026 — 至今',
                current: false,
                summary: '一句话说明负责的业务与范围。',
                highlights: ['关键成果或职责'],
                tags: ['标签'],
              }
              d.experiences.unshift(item)
            })
          }
        >
          <Plus size={14} /> 添加经历
        </button>
      </div>

      <div className="admin-repeat-list">
        {content.experiences.map((item, index) => (
          <div className={`admin-subcard ${item.current ? 'is-current' : ''}`} key={index}>
            <div className="admin-subcard-head">
              <span>
                {String(index + 1).padStart(2, '0')} / {item.company}
                {item.current ? <i className="admin-now-badge">NOW</i> : null}
              </span>
              <button
                type="button"
                onClick={() => update((d) => void d.experiences.splice(index, 1))}
              >
                <Trash size={13} />
              </button>
            </div>
            <div className="admin-form-grid">
              <Field label="公司">
                <TextInput
                  value={item.company}
                  onChange={(value) =>
                    update((d) => void (d.experiences[index].company = value))
                  }
                />
              </Field>
              <Field label="职位">
                <TextInput
                  value={item.role}
                  onChange={(value) => update((d) => void (d.experiences[index].role = value))}
                />
              </Field>
              <Field label="时间">
                <TextInput
                  value={item.period}
                  onChange={(value) =>
                    update((d) => void (d.experiences[index].period = value))
                  }
                />
              </Field>
              <Field label="是否当前工作">
                <label className="admin-checkbox">
                  <input
                    type="checkbox"
                    checked={item.current}
                    onChange={(event) =>
                      update((d) => void (d.experiences[index].current = event.target.checked))
                    }
                  />
                  <span>{item.current ? '当前工作' : '过往经历'}</span>
                </label>
              </Field>
              <Field label="概述" wide>
                <TextArea
                  value={item.summary}
                  rows={2}
                  onChange={(value) =>
                    update((d) => void (d.experiences[index].summary = value))
                  }
                />
              </Field>
              <Field label="能力标签（逗号分隔）" wide>
                <TagField
                  value={item.tags}
                  onChange={(tags) => update((d) => void (d.experiences[index].tags = tags))}
                />
              </Field>
            </div>

            <div className="admin-array-block">
              <div className="admin-array-head">
                <span>关键成果</span>
                <button
                  type="button"
                  onClick={() =>
                    update((d) => void d.experiences[index].highlights.push('新的成果'))
                  }
                >
                  <Plus size={13} /> 添加
                </button>
              </div>
              {item.highlights.map((highlight, highlightIndex) => (
                <div className="admin-repeat-row" key={highlightIndex}>
                  <TextArea
                    value={highlight}
                    rows={2}
                    onChange={(value) =>
                      update(
                        (d) => void (d.experiences[index].highlights[highlightIndex] = value),
                      )
                    }
                  />
                  <button
                    type="button"
                    className="admin-row-remove"
                    aria-label="删除成果"
                    onClick={() =>
                      update((d) => void d.experiences[index].highlights.splice(highlightIndex, 1))
                    }
                  >
                    <Trash size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProjectsTab({
  content,
  update,
  selectedSlug,
  setSelectedSlug,
  notify,
}: {
  content: SiteContent
  update: Update
  selectedSlug: string
  setSelectedSlug: (slug: string) => void
  notify: (message: string, type?: 'ok' | 'error') => void
}) {
  const project = content.projects.find((item) => item.slug === selectedSlug) || content.projects[0]
  const index = project ? content.projects.findIndex((item) => item.slug === project.slug) : -1

  function addProject() {
    const slug = `new-project-${Date.now().toString(36)}`
    update((d) => {
      const next: Project = {
        slug,
        order: d.projects.length + 1,
        featured: true,
        title: '新项目',
        titleEn: 'NEW PROJECT',
        subtitle: '一句话说明项目',
        category: '分类',
        categoryEn: 'CATEGORY',
        year: '2026',
        role: '设计角色',
        duration: '2026',
        client: '客户 / 团队',
        team: '团队',
        cover: '/images/project-gzqx.jpg',
        coverAlt: '项目封面',
        coverStyle: 'image',
        accent: '#c8f04f',
        showcase: '',
        summary: '一句话项目摘要。',
        intro: '项目背景与整体介绍。',
        challenge: '项目挑战。',
        approach: '设计策略。',
        metrics: [
          { value: '01', label: '项目指标' },
          { value: '01', label: '项目指标' },
          { value: '01', label: '项目指标' },
        ],
        sections: [
          {
            no: '01',
            title: '设计过程',
            titleEn: 'PROCESS',
            body: '描述这一段的设计过程。',
            image: '',
            caption: '',
            layout: 'text',
          },
        ],
        gallery: [],
      }
      d.projects.push(next)
    })
    setSelectedSlug(slug)
  }

  function deleteProject() {
    if (!project) return
    if (!window.confirm(`确定删除「${project.title}」？此操作不可撤销。`)) return
    update((d) => {
      d.projects = d.projects.filter((item) => item.slug !== project.slug)
    })
    const next = content.projects.find((item) => item.slug !== project.slug)
    setSelectedSlug(next?.slug || '')
  }

  function moveProject(direction: -1 | 1) {
    if (!project) return
    update((d) => {
      const current = d.projects.findIndex((item) => item.slug === project.slug)
      const target = current + direction
      if (target < 0 || target >= d.projects.length) return
      const [moved] = d.projects.splice(current, 1)
      d.projects.splice(target, 0, moved)
      d.projects.forEach((item, itemIndex) => {
        item.order = itemIndex + 1
      })
    })
  }

  return (
    <div className="admin-projects">
      <aside className="admin-project-list">
        <div className="admin-project-list-head">
          <span>{content.projects.length} 个作品</span>
          <button type="button" onClick={addProject}>
            <Plus size={14} /> 新建
          </button>
        </div>
        {content.projects.map((item) => (
          <button
            type="button"
            key={item.slug}
            className={`admin-project-item ${project?.slug === item.slug ? 'is-active' : ''}`}
            onClick={() => setSelectedSlug(item.slug)}
          >
            <span className="admin-project-thumb">
              {item.coverStyle === 'ai' ? (
                <span className="admin-project-ai">AI</span>
              ) : (
                <img src={item.cover} alt="" />
              )}
            </span>
            <span className="admin-project-item-copy">
              <strong>{item.title}</strong>
              <small>
                {item.year} · {item.category}
              </small>
            </span>
            {item.featured ? <i className="admin-featured-dot" /> : null}
          </button>
        ))}
      </aside>

      {project ? (
        <div className="admin-project-editor">
          <div className="admin-project-editor-head">
            <div>
              <span className="admin-eyebrow">PROJECT / {String(index + 1).padStart(2, '0')}</span>
              <h2>{project.title}</h2>
            </div>
            <div className="admin-project-actions">
              <button type="button" onClick={() => moveProject(-1)} disabled={index <= 0}>
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveProject(1)}
                disabled={index >= content.projects.length - 1}
              >
                ↓
              </button>
              <Link to={`/work/${project.slug}`} target="_blank" rel="noreferrer">
                预览 <ArrowUpRight size={13} />
              </Link>
              <button type="button" className="is-danger" onClick={deleteProject}>
                <Trash size={13} /> 删除
              </button>
            </div>
          </div>

          <FormSection title="基础信息" en="INFO">
            <div className="admin-form-grid">
              <Field label="项目名称">
                <TextInput
                  value={project.title}
                  onChange={(value) => update((d) => void (d.projects[index].title = value))}
                />
              </Field>
              <Field label="英文名称">
                <TextInput
                  value={project.titleEn}
                  onChange={(value) => update((d) => void (d.projects[index].titleEn = value))}
                />
              </Field>
              <Field label="URL 标识" hint="仅英文、数字与短横线">
                <TextInput
                  value={project.slug}
                  onChange={(value) => {
                    update((d) => void (d.projects[index].slug = value))
                    setSelectedSlug(value)
                  }}
                />
              </Field>
              <Field label="副标题">
                <TextInput
                  value={project.subtitle}
                  onChange={(value) => update((d) => void (d.projects[index].subtitle = value))}
                />
              </Field>
              <Field label="分类">
                <TextInput
                  value={project.category}
                  onChange={(value) => update((d) => void (d.projects[index].category = value))}
                />
              </Field>
              <Field label="英文分类">
                <TextInput
                  value={project.categoryEn}
                  onChange={(value) => update((d) => void (d.projects[index].categoryEn = value))}
                />
              </Field>
              <Field label="年份">
                <TextInput
                  value={project.year}
                  onChange={(value) => update((d) => void (d.projects[index].year = value))}
                />
              </Field>
              <Field label="你的角色">
                <TextInput
                  value={project.role}
                  onChange={(value) => update((d) => void (d.projects[index].role = value))}
                />
              </Field>
              <Field label="项目周期">
                <TextInput
                  value={project.duration}
                  onChange={(value) => update((d) => void (d.projects[index].duration = value))}
                />
              </Field>
              <Field label="客户 / 公司">
                <TextInput
                  value={project.client}
                  onChange={(value) => update((d) => void (d.projects[index].client = value))}
                />
              </Field>
              <Field label="团队">
                <TextInput
                  value={project.team}
                  onChange={(value) => update((d) => void (d.projects[index].team = value))}
                />
              </Field>
              <Field label="品牌强调色">
                <div className="admin-color-field">
                  <input
                    type="color"
                    value={project.accent}
                    onChange={(event) =>
                      update((d) => void (d.projects[index].accent = event.target.value))
                    }
                  />
                  <TextInput
                    value={project.accent}
                    onChange={(value) =>
                      update((d) => void (d.projects[index].accent = value))
                    }
                  />
                </div>
              </Field>
              <Field label="封面类型">
                <select
                  className="admin-input"
                  value={project.coverStyle}
                  onChange={(event) =>
                    update((d) => void (d.projects[index].coverStyle = event.target.value))
                  }
                >
                  <option value="image">上传 / 图片</option>
                  <option value="ai">AI 交互封面</option>
                </select>
              </Field>
              <Field label="特殊展示">
                <select
                  className="admin-input"
                  value={project.showcase}
                  onChange={(event) =>
                    update((d) => void (d.projects[index].showcase = event.target.value))
                  }
                >
                  <option value="">标准</option>
                  <option value="ai">嵌入 AI 交互演示</option>
                </select>
              </Field>
              <Field label="排序">
                <TextInput
                  type="number"
                  value={String(project.order)}
                  onChange={(value) =>
                    update((d) => void (d.projects[index].order = Number(value) || 0))
                  }
                />
              </Field>
              <Field label="首页展示">
                <label className="admin-checkbox">
                  <input
                    type="checkbox"
                    checked={project.featured}
                    onChange={(event) =>
                      update((d) => void (d.projects[index].featured = event.target.checked))
                    }
                  />
                  <span>{project.featured ? '已展示' : '隐藏'}</span>
                </label>
              </Field>
            </div>

            <div className="admin-form-grid">
              <Field label="一句话摘要" wide>
                <TextArea
                  value={project.summary}
                  rows={2}
                  onChange={(value) => update((d) => void (d.projects[index].summary = value))}
                />
              </Field>
              <Field label="项目介绍" wide>
                <TextArea
                  value={project.intro}
                  rows={4}
                  onChange={(value) => update((d) => void (d.projects[index].intro = value))}
                />
              </Field>
              <Field label="挑战">
                <TextArea
                  value={project.challenge}
                  rows={3}
                  onChange={(value) => update((d) => void (d.projects[index].challenge = value))}
                />
              </Field>
              <Field label="策略">
                <TextArea
                  value={project.approach}
                  rows={3}
                  onChange={(value) => update((d) => void (d.projects[index].approach = value))}
                />
              </Field>
            </div>

            {project.coverStyle !== 'ai' ? (
              <div className="admin-form-grid">
                <Field label="项目封面" wide>
                  <ImageField
                    value={project.cover}
                    onChange={(value) => update((d) => void (d.projects[index].cover = value))}
                    notify={notify}
                  />
                </Field>
                <Field label="封面替代文字" wide>
                  <TextInput
                    value={project.coverAlt}
                    onChange={(value) => update((d) => void (d.projects[index].coverAlt = value))}
                  />
                </Field>
              </div>
            ) : null}
          </FormSection>

          <FormSection title="项目指标" en="METRICS">
            <div className="admin-array-block">
              {project.metrics.map((metric, metricIndex) => (
                <div className="admin-repeat-row admin-metric-row" key={metricIndex}>
                  <TextInput
                    value={metric.value}
                    placeholder="数值"
                    onChange={(value) =>
                      update(
                        (d) => void (d.projects[index].metrics[metricIndex].value = value),
                      )
                    }
                  />
                  <TextInput
                    value={metric.label}
                    placeholder="说明"
                    onChange={(value) =>
                      update(
                        (d) => void (d.projects[index].metrics[metricIndex].label = value),
                      )
                    }
                  />
                  <button
                    type="button"
                    className="admin-row-remove"
                    aria-label="删除指标"
                    onClick={() =>
                      update((d) => void d.projects[index].metrics.splice(metricIndex, 1))
                    }
                  >
                    <Trash size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="admin-add-button"
              onClick={() =>
                update((d) => {
                  const item: Metric = { value: '01', label: '新指标' }
                  d.projects[index].metrics.push(item)
                })
              }
            >
              <Plus size={14} /> 添加指标
            </button>
          </FormSection>

          <FormSection title="设计过程" en="CASE SECTIONS">
            <div className="admin-accordion-list">
              {project.sections.map((section, sectionIndex) => (
                <details className="admin-accordion" key={sectionIndex} open={sectionIndex === 0}>
                  <summary>
                    <span>
                      {section.no} / {section.title}
                    </span>
                    <ChevronDown size={15} />
                  </summary>
                  <div className="admin-accordion-body">
                    <div className="admin-form-grid">
                      <Field label="序号">
                        <TextInput
                          value={section.no}
                          onChange={(value) =>
                            update(
                              (d) =>
                                void (d.projects[index].sections[sectionIndex].no = value),
                            )
                          }
                        />
                      </Field>
                      <Field label="展示方式">
                        <select
                          className="admin-input"
                          value={section.layout}
                          onChange={(event) =>
                            update(
                              (d) =>
                                void (d.projects[index].sections[sectionIndex].layout = event.target
                                  .value as ProjectSection['layout']),
                            )
                          }
                        >
                          <option value="text">文字</option>
                          <option value="image">文字 + 图片</option>
                          <option value="split">图文分栏</option>
                        </select>
                      </Field>
                      <Field label="标题">
                        <TextInput
                          value={section.title}
                          onChange={(value) =>
                            update(
                              (d) =>
                                void (d.projects[index].sections[sectionIndex].title = value),
                            )
                          }
                        />
                      </Field>
                      <Field label="英文标题">
                        <TextInput
                          value={section.titleEn}
                          onChange={(value) =>
                            update(
                              (d) =>
                                void (d.projects[index].sections[sectionIndex].titleEn = value),
                            )
                          }
                        />
                      </Field>
                      <Field label="正文（空行分段）" wide>
                        <TextArea
                          value={section.body}
                          rows={6}
                          onChange={(value) =>
                            update(
                              (d) =>
                                void (d.projects[index].sections[sectionIndex].body = value),
                            )
                          }
                        />
                      </Field>
                      <Field label="配图（可选）" wide>
                        <ImageField
                          value={section.image}
                          onChange={(value) =>
                            update(
                              (d) =>
                                void (d.projects[index].sections[sectionIndex].image = value),
                            )
                          }
                          notify={notify}
                        />
                      </Field>
                      <Field label="配图说明" wide>
                        <TextInput
                          value={section.caption}
                          onChange={(value) =>
                            update(
                              (d) =>
                                void (d.projects[index].sections[sectionIndex].caption = value),
                            )
                          }
                        />
                      </Field>
                    </div>
                    <button
                      type="button"
                      className="admin-danger-button"
                      onClick={() =>
                        update((d) => void d.projects[index].sections.splice(sectionIndex, 1))
                      }
                    >
                      <Trash size={13} /> 删除这一段
                    </button>
                  </div>
                </details>
              ))}
            </div>
            <button
              type="button"
              className="admin-add-button"
              onClick={() =>
                update((d) => {
                  const item: ProjectSection = {
                    no: String(d.projects[index].sections.length + 1).padStart(2, '0'),
                    title: '新的设计阶段',
                    titleEn: 'NEW SECTION',
                    body: '描述这一段的设计过程。',
                    image: '',
                    caption: '',
                    layout: 'text',
                  }
                  d.projects[index].sections.push(item)
                })
              }
            >
              <Plus size={14} /> 添加设计阶段
            </button>
          </FormSection>

          <FormSection title="画廊" en="GALLERY">
            <div className="admin-array-block">
              {project.gallery.map((item, galleryIndex) => (
                <div className="admin-subcard" key={galleryIndex}>
                  <div className="admin-subcard-head">
                    <span>图片 {String(galleryIndex + 1).padStart(2, '0')}</span>
                    <button
                      type="button"
                      onClick={() =>
                        update((d) => void d.projects[index].gallery.splice(galleryIndex, 1))
                      }
                    >
                      <Trash size={13} />
                    </button>
                  </div>
                  <ImageField
                    value={item.src}
                    onChange={(value) =>
                      update(
                        (d) => void (d.projects[index].gallery[galleryIndex].src = value),
                      )
                    }
                    notify={notify}
                  />
                  <TextInput
                    value={item.caption}
                    placeholder="图片说明"
                    onChange={(value) =>
                      update(
                        (d) => void (d.projects[index].gallery[galleryIndex].caption = value),
                      )
                    }
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              className="admin-add-button"
              onClick={() =>
                update((d) => {
                  const item: GalleryItem = { src: '/images/project-gzqx.jpg', caption: '图片说明' }
                  d.projects[index].gallery.push(item)
                })
              }
            >
              <Plus size={14} /> 添加画廊图片
            </button>
          </FormSection>
        </div>
      ) : (
        <div className="admin-empty">还没有作品，点击左侧「新建」开始。</div>
      )}
    </div>
  )
}

function SkillsTab({ content, update }: { content: SiteContent; update: Update }) {
  return (
    <div className="admin-form">
      <div className="admin-list-head">
        <p>这些标签会出现在「关于我」下方，建议每类保持 4–6 项。</p>
        <button
          type="button"
          className="admin-add-button"
          onClick={() =>
            update((d) => {
              const item: SkillGroup = { title: '新分类', titleEn: 'NEW', items: ['能力'] }
              d.skills.push(item)
            })
          }
        >
          <Plus size={14} /> 添加分类
        </button>
      </div>
      <div className="admin-repeat-list">
        {content.skills.map((group, index) => (
          <div className="admin-subcard" key={index}>
            <div className="admin-subcard-head">
              <span>{group.title}</span>
              <button type="button" onClick={() => update((d) => void d.skills.splice(index, 1))}>
                <Trash size={13} />
              </button>
            </div>
            <div className="admin-form-grid">
              <Field label="分类名称">
                <TextInput
                  value={group.title}
                  onChange={(value) => update((d) => void (d.skills[index].title = value))}
                />
              </Field>
              <Field label="英文名称">
                <TextInput
                  value={group.titleEn}
                  onChange={(value) => update((d) => void (d.skills[index].titleEn = value))}
                />
              </Field>
            </div>
            <div className="admin-array-block">
              <div className="admin-array-head">
                <span>能力项</span>
                <button
                  type="button"
                  onClick={() => update((d) => void d.skills[index].items.push('新能力'))}
                >
                  <Plus size={13} /> 添加
                </button>
              </div>
              {group.items.map((item, itemIndex) => (
                <div className="admin-repeat-row" key={itemIndex}>
                  <TextInput
                    value={item}
                    onChange={(value) =>
                      update((d) => void (d.skills[index].items[itemIndex] = value))
                    }
                  />
                  <button
                    type="button"
                    className="admin-row-remove"
                    aria-label="删除能力"
                    onClick={() => update((d) => void d.skills[index].items.splice(itemIndex, 1))}
                  >
                    <Trash size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ContactTab({ content, update }: { content: SiteContent; update: Update }) {
  const { contact } = content
  return (
    <div className="admin-form">
      <FormSection title="联系区" en="CONTACT">
        <div className="admin-form-grid">
          <Field label="眉标">
            <TextInput
              value={contact.eyebrow}
              onChange={(value) => update((d) => void (d.contact.eyebrow = value))}
            />
          </Field>
          <Field label="英文大字">
            <TextInput
              value={contact.headingEn}
              onChange={(value) => update((d) => void (d.contact.headingEn = value))}
            />
          </Field>
          <Field label="中文标题（可换行）" wide>
            <TextArea
              value={contact.heading}
              rows={2}
              onChange={(value) => update((d) => void (d.contact.heading = value))}
            />
          </Field>
          <Field label="说明" wide>
            <TextArea
              value={contact.body}
              rows={3}
              onChange={(value) => update((d) => void (d.contact.body = value))}
            />
          </Field>
          <Field label="按钮文案">
            <TextInput
              value={contact.ctaLabel}
              onChange={(value) => update((d) => void (d.contact.ctaLabel = value))}
            />
          </Field>
          <Field label="联系邮箱">
            <TextInput
              value={contact.email}
              onChange={(value) => update((d) => void (d.contact.email = value))}
            />
          </Field>
          <Field label="页脚位置说明" wide>
            <TextInput
              value={contact.footerNote}
              onChange={(value) => update((d) => void (d.contact.footerNote = value))}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="页脚" en="FOOTER">
        <div className="admin-form-grid">
          <Field label="版权信息">
            <TextInput
              value={contact.copyright}
              onChange={(value) => update((d) => void (d.contact.copyright = value))}
            />
          </Field>
          <Field label="制作说明">
            <TextInput
              value={contact.builtWith}
              onChange={(value) => update((d) => void (d.contact.builtWith = value))}
            />
          </Field>
        </div>
      </FormSection>
    </div>
  )
}

/* --------------------------------------------------------
   Small form elements
   -------------------------------------------------------- */

function FormSection({
  title,
  en,
  children,
}: {
  title: string
  en: string
  children: ReactNode
}) {
  return (
    <section className="admin-form-section">
      <div className="admin-form-section-head">
        <span>{en}</span>
        <h2>{title}</h2>
      </div>
      <div className="admin-form-section-body">{children}</div>
    </section>
  )
}

function Field({
  label,
  hint,
  wide,
  children,
}: {
  label: string
  hint?: string
  wide?: boolean
  children: ReactNode
}) {
  return (
    <label className={`admin-field ${wide ? 'is-wide' : ''}`}>
      <span className="admin-field-label">
        {label}
        {hint ? <small>{hint}</small> : null}
      </span>
      {children}
    </label>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <input
      className="admin-input"
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}

function TextArea({
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  rows?: number
  placeholder?: string
}) {
  return (
    <textarea
      className="admin-input admin-textarea"
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}

function TagField({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) {
  const [text, setText] = useState(value.join(', '))
  const focused = useRef(false)
  useEffect(() => {
    if (!focused.current) setText(value.join(', '))
  }, [value])
  return (
    <input
      className="admin-input"
      value={text}
      onFocus={() => {
        focused.current = true
      }}
      onBlur={() => {
        focused.current = false
        setText(value.join(', '))
      }}
      onChange={(event) => {
        setText(event.target.value)
        onChange(
          event.target.value
            .split(/[,，]/)
            .map((item) => item.trim())
            .filter(Boolean),
        )
      }}
      placeholder="用逗号分隔，例如：金融 AI, 设计系统"
    />
  )
}

function ImageField({
  value,
  onChange,
  notify,
}: {
  value: string
  onChange: (value: string) => void
  notify: (message: string, type?: 'ok' | 'error') => void
}) {
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setBusy(true)
    try {
      const result = await uploadImage(file)
      onChange(result.url)
      notify('图片已上传')
    } catch (error) {
      notify(error instanceof Error ? error.message : '上传失败', 'error')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="admin-image-field">
      <div className="admin-image-preview">
        {value ? (
          <img src={value} alt="" />
        ) : (
          <span className="admin-image-empty">NO IMAGE</span>
        )}
      </div>
      <div className="admin-image-controls">
        <input
          className="admin-input"
          value={value}
          placeholder="/images/… 或上传图片"
          onChange={(event) => onChange(event.target.value)}
        />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={busy}>
          <Upload size={14} />
          {busy ? '上传中…' : '上传图片'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          hidden
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
        <small>支持 JPG / PNG / WebP，单张不超过 10MB。</small>
      </div>
    </div>
  )
}

/* --------------------------------------------------------
   Utilities
   -------------------------------------------------------- */

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Shanghai',
    }).format(new Date(value))
  } catch {
    return value
  }
}

function formatDateShort(value: string) {
  try {
    return new Intl.DateTimeFormat('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Shanghai',
    }).format(new Date(value))
  } catch {
    return value
  }
}
