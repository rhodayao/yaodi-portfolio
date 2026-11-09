import { Link, useParams } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import { usePageMeta, useReveal } from '../hooks/useSite'
import type { Project } from '../types'
import { AiCover } from '../components/AiCover'
import { AiDemo } from '../components/AiDemo'
import { ArrowLeft, ArrowUpRight, Spark } from '../components/Icons'
import { NotFound } from './NotFound'

function Paragraphs({ body }: { body: string }) {
  return (
    <>
      {body
        .split('\n\n')
        .filter(Boolean)
        .map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
    </>
  )
}

function ProjectMedia({ project }: { project: Project }) {
  if (project.coverStyle === 'ai') {
    return <AiCover project={project} />
  }
  if (!project.cover) {
    return <div className="project-media project-media--empty" />
  }
  return (
    <img
      className="project-media"
      src={project.cover}
      alt={project.coverAlt}
      loading="eager"
    />
  )
}

export function ProjectPage() {
  const { slug } = useParams()
  const { content } = useContent()
  const projects = [...content.projects].sort((a, b) => a.order - b.order)
  const project = projects.find((item) => item.slug === slug)
  useReveal(Boolean(project))
  usePageMeta(
    project ? `${project.title} · ${project.titleEn} — 姚迪作品集` : '项目不存在 — 姚迪作品集',
    project?.summary,
  )

  if (!project) return <NotFound />

  const index = projects.findIndex((item) => item.slug === project.slug)
  const next = projects[(index + 1) % projects.length]

  return (
    <article
      className="project-page"
      style={{ ['--project-accent' as string]: project.accent }}
    >
      <header className="project-hero">
        <div className="project-hero-bg" aria-hidden="true">
          <div className="project-hero-glow" />
          <div className="project-hero-grid" />
        </div>

        <div className="section-shell">
          <div className="project-topbar" data-reveal>
            <Link to="/#work" className="project-back" data-cursor="BACK">
              <ArrowLeft size={17} />
              返回作品列表
            </Link>
            <div className="project-counter">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <span className="project-counter-line" />
              <span>{String(projects.length).padStart(2, '0')}</span>
            </div>
          </div>

          <div className="project-heading" data-reveal>
            <div className="project-kicker">
              <span className="lime-dot" />
              {project.category}
              <span className="project-year">{project.year}</span>
            </div>
            <h1>{project.title}</h1>
            <div className="project-heading-row">
              <span className="project-title-en">{project.titleEn}</span>
              <p>{project.subtitle}</p>
            </div>
          </div>

          <div className="project-cover" data-reveal>
            <ProjectMedia project={project} />
            <div className="project-cover-caption">
              <span>{project.titleEn} / CASE STUDY</span>
              <span>{project.year}</span>
            </div>
          </div>

          <div className="project-meta" data-reveal>
            <div>
              <span className="micro-label">ROLE</span>
              <p>{project.role}</p>
            </div>
            <div>
              <span className="micro-label">DURATION</span>
              <p>{project.duration}</p>
            </div>
            <div>
              <span className="micro-label">CLIENT / TEAM</span>
              <p>{project.client}</p>
              <small>{project.team}</small>
            </div>
            <div>
              <span className="micro-label">SCOPE</span>
              <p>{project.sections.length} 个设计阶段</p>
              <small>{project.categoryEn}</small>
            </div>
          </div>
        </div>
      </header>

      <section className="project-overview section-shell">
        <div className="project-overview-head" data-reveal>
          <span className="section-label compact">
            <span className="section-no">01</span>
            <span>OVERVIEW</span>
            <span className="section-line" />
          </span>
          <span>项目概览</span>
        </div>

        <div className="project-overview-grid">
          <p className="project-intro" data-reveal>
            {project.intro}
          </p>
          <div className="project-brief" data-reveal>
            <div className="brief-block">
              <span className="brief-no">A</span>
              <div>
                <h3>挑战</h3>
                <p>{project.challenge}</p>
              </div>
            </div>
            <div className="brief-block">
              <span className="brief-no">B</span>
              <div>
                <h3>策略</h3>
                <p>{project.approach}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="project-metrics" data-reveal>
          {project.metrics.map((metric, metricIndex) => (
            <div className="project-metric" key={metric.label}>
              <span className="project-metric-index">0{metricIndex + 1}</span>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </div>
          ))}
        </div>
      </section>

      {project.showcase === 'ai' ? (
        <section className="section-shell project-demo-wrap">
          <AiDemo project={project} />
        </section>
      ) : null}

      <section className="project-case section-shell">
        <div className="project-case-head" data-reveal>
          <span className="section-label compact">
            <span className="section-no">02</span>
            <span>PROCESS &amp; DECISIONS</span>
            <span className="section-line" />
          </span>
          <span>过程与决策</span>
        </div>

        <div className="case-list">
          {project.sections.map((section, sectionIndex) => (
            <div className="case-row" key={section.no} data-reveal>
              <aside className="case-aside">
                <span className="case-no">{section.no}</span>
                <span className="case-en">{section.titleEn}</span>
                <span className="case-progress">
                  <i style={{ width: `${((sectionIndex + 1) / project.sections.length) * 100}%` }} />
                </span>
              </aside>
              <div className="case-main">
                <h2>{section.title}</h2>
                <div className="case-body">
                  <Paragraphs body={section.body} />
                </div>
                {section.image ? (
                  <figure className="case-figure">
                    <img src={section.image} alt={section.caption || section.title} loading="lazy" />
                    {section.caption ? <figcaption>{section.caption}</figcaption> : null}
                  </figure>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      {project.gallery.length ? (
        <section className="project-gallery section-shell" data-reveal>
          <div className="project-gallery-head">
            <span className="section-label compact">
              <span className="section-no">03</span>
              <span>GALLERY</span>
              <span className="section-line" />
            </span>
            <span>视觉记录</span>
          </div>
          <div className="gallery-grid">
            {project.gallery.map((item) => (
              <figure key={item.src + item.caption}>
                <img src={item.src} alt={item.caption} loading="lazy" />
                <figcaption>{item.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      <section className="project-end section-shell" data-reveal>
        <div className="project-end-mark">
          <Spark size={22} />
          <span>END OF CASE / {project.titleEn}</span>
        </div>
        <div className="project-next-head">
          <span className="micro-label">NEXT PROJECT</span>
          <span>继续浏览</span>
        </div>
        <Link
          to={`/work/${next.slug}`}
          className="project-next"
          data-cursor="NEXT"
          aria-label={`下一个项目：${next.title}`}
        >
          <div className="project-next-copy">
            <span className="project-next-index">
              {String(projects.findIndex((item) => item.slug === next.slug) + 1).padStart(2, '0')}
            </span>
            <h3>{next.title}</h3>
            <p>{next.subtitle}</p>
          </div>
          <div className="project-next-media">
            {next.coverStyle === 'ai' ? (
              <AiCover project={next} compact />
            ) : (
              <img src={next.cover} alt="" loading="lazy" />
            )}
          </div>
          <span className="project-next-arrow">
            <ArrowUpRight size={28} />
          </span>
        </Link>
      </section>
    </article>
  )
}
