import { useRef, useState, type FocusEvent, type PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import type { Project } from '../types'
import { ArrowUpRight } from './Icons'
import { AiCover } from './AiCover'

export function WorkIndex() {
  const { content } = useContent()
  const projects = [...content.projects].sort((a, b) => a.order - b.order)
  const [active, setActive] = useState<number | null>(null)
  const previewRef = useRef<HTMLDivElement | null>(null)

  function placePreview(clientX: number, clientY: number) {
    const node = previewRef.current
    if (!node) return
    const width = node.offsetWidth || 430
    const height = node.offsetHeight || 300
    const gap = 28
    let x = clientX + gap
    let y = clientY - height / 2
    if (x + width > window.innerWidth - 24) x = clientX - width - gap
    x = Math.max(16, Math.min(x, window.innerWidth - width - 16))
    y = Math.max(16, Math.min(y, window.innerHeight - height - 16))
    node.style.transform = `translate3d(${x}px, ${y}px, 0)`
  }

  function handleMove(event: PointerEvent<HTMLAnchorElement>) {
    if (event.pointerType !== 'mouse') return
    placePreview(event.clientX, event.clientY)
  }

  function handleFocus(event: FocusEvent<HTMLAnchorElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    placePreview(rect.left + rect.width * 0.55, rect.top + rect.height / 2)
  }

  const activeProject: Project | null = active === null ? null : projects[active] || null

  return (
    <section className="work-section" id="work" aria-labelledby="work-heading">
      <div className="work-bg-word" aria-hidden="true">
        WORKS
      </div>

      <div className="section-shell">
        <header className="work-head" data-reveal>
          <div className="section-label">
            <span className="section-no">03</span>
            <span>SELECTED WORK</span>
            <span className="section-line" />
            <span className="section-meta">2024 — 2026</span>
          </div>
          <div className="work-head-main">
            <h2 id="work-heading" className="work-title">
              <span className="work-title-cn">作品</span>
              <span className="work-title-en">
                SELECTED
                <br />
                WORKS<span className="lime">®</span>
              </span>
            </h2>
            <div className="work-head-note">
              <p>
                从省级监管系统、数据可视化，到金融 AI 产品。
                <br />
                每一个项目，都是一次把复杂性翻译成清晰体验的尝试。
              </p>
              <span className="work-count">
                <b>05</b> PROJECTS / 2024—2026
              </span>
            </div>
          </div>
        </header>

        <div className="work-list">
          {projects.map((project, index) => (
            <Link
              to={`/work/${project.slug}`}
              key={project.slug}
              className={`work-row ${active === index ? 'is-active' : ''}`}
              onPointerEnter={(event) => {
                setActive(index)
                if (event.pointerType === 'mouse') placePreview(event.clientX, event.clientY)
              }}
              onPointerMove={handleMove}
              onPointerLeave={() => setActive(null)}
              onFocus={handleFocus}
              onBlur={() => setActive(null)}
              data-cursor="VIEW"
              aria-label={`查看项目：${project.title}，${project.subtitle}`}
            >
              <span className="work-row-index">0{index + 1}</span>
              <span className="work-row-main">
                <span className="work-row-title">{project.title}</span>
                <span className="work-row-en">{project.titleEn}</span>
                <span className="work-row-summary">{project.summary}</span>
              </span>
              <span className="work-row-meta">
                <span>{project.category}</span>
                <span>{project.year}</span>
              </span>
              <span className="work-row-arrow">
                <ArrowUpRight size={24} />
              </span>

              <span className="work-row-mobile-media">
                {project.coverStyle === 'ai' ? (
                  <AiCover project={project} compact />
                ) : (
                  <img src={project.cover} alt={project.coverAlt} loading="lazy" />
                )}
              </span>
            </Link>
          ))}
        </div>

        <div className="work-foot" data-reveal>
          <span className="work-foot-line" />
          <p>更多项目与设计过程，持续整理中。</p>
          <Link to="/work/bown-ai" className="work-foot-link" data-cursor="OPEN">
            最新项目 / 博闻智数 <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>

      <div
        ref={previewRef}
        className={`work-preview ${active !== null ? 'is-visible' : ''}`}
        aria-hidden="true"
      >
        <div className="work-preview-inner">
          {activeProject ? (
            activeProject.coverStyle === 'ai' ? (
              <AiCover project={activeProject} compact />
            ) : (
              <img src={activeProject.cover} alt="" loading="eager" />
            )
          ) : null}
          <div className="work-preview-tag">
            <span>{activeProject ? activeProject.year : ''}</span>
            <span>VIEW PROJECT</span>
          </div>
        </div>
      </div>
    </section>
  )
}
