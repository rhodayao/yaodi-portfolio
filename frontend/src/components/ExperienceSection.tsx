import { useState } from 'react'
import { useContent } from '../context/ContentContext'
import { SectionHead } from './SectionHead'
import { Plus } from './Icons'

export function ExperienceSection() {
  const { content } = useContent()
  const [open, setOpen] = useState(0)

  return (
    <section
      className="experience-section section"
      id="experience"
      aria-labelledby="experience-heading"
    >
      <div className="section-shell">
        <SectionHead
          no="02"
          label="EXPERIENCE / 工作经历"
          title="经历"
          titleEn="EXPERIENCE"
          note={<p>从 C 端到 B/G 端，从视觉到体验，从执行到决策。每一年都在扩大问题的边界。</p>}
        />

        <div className="timeline" data-reveal>
          {content.experiences.map((item, index) => {
            const expanded = open === index
            return (
              <article
                className={`timeline-item ${item.current ? 'is-current' : ''} ${
                  expanded ? 'is-open' : ''
                }`}
                key={`${item.company}-${item.period}`}
              >
                <div className="timeline-marker" aria-hidden="true">
                  <span className="timeline-dot" />
                  <span className="timeline-line" />
                </div>

                <div className="timeline-period">
                  <span>{item.period}</span>
                  {item.current ? <em>NOW</em> : <em className="muted">0{4 - index}</em>}
                </div>

                <button
                  type="button"
                  className="timeline-trigger"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? -1 : index)}
                  data-cursor={expanded ? 'CLOSE' : 'OPEN'}
                >
                  <span className="timeline-title">
                    <strong>{item.company}</strong>
                    <span>{item.role}</span>
                  </span>
                  <span className="timeline-tags">
                    {item.tags.map((tag) => (
                      <i key={tag}>{tag}</i>
                    ))}
                  </span>
                  <span className={`timeline-toggle ${expanded ? 'is-open' : ''}`}>
                    <Plus size={18} />
                  </span>
                </button>

                <div className="timeline-detail" aria-hidden={!expanded}>
                  <div className="timeline-detail-inner">
                    <p className="timeline-summary">{item.summary}</p>
                    <ul className="timeline-highlights">
                      {item.highlights.map((highlight) => (
                        <li key={highlight}>
                          <span>↳</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <div className="experience-foot" data-reveal>
          <div>
            <span className="micro-label">EDUCATION</span>
            <p>湖北工业大学 · 产品设计 · 本科</p>
          </div>
          <div>
            <span className="micro-label">BEYOND WORK</span>
            <p>古筝十级 · 金融与心理学阅读 · 独自旅行</p>
          </div>
          <div>
            <span className="micro-label">FOCUS</span>
            <p>B/G 端 · 数据可视化 · AI 产品体验</p>
          </div>
        </div>
      </div>
    </section>
  )
}
