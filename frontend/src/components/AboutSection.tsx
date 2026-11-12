import { useContent } from '../context/ContentContext'
import { SectionHead } from './SectionHead'
import { ArrowUpRight } from './Icons'

export function AboutSection() {
  const { content } = useContent()
  const { about, skills } = content
  const headingLines = about.heading.split('\n')

  return (
    <section className="about-section section" id="about" aria-labelledby="about-heading">
      <div className="section-shell">
        <SectionHead
          no="01"
          label="ABOUT / 关于我"
          title="关于"
          titleEn="ABOUT ME"
          note={<p>设计师不是一个职位的名字，而是一种持续追问「为什么」的工作方式。</p>}
        />

        <div className="about-grid">
          <div className="about-visual" data-reveal>
            <div className="about-photo-frame">
              <img src={about.portrait} alt={about.portraitAlt} loading="eager" />
              <div className="about-photo-overlay" />
              <span className="corner corner--tl" />
              <span className="corner corner--tr" />
              <span className="corner corner--bl" />
              <span className="corner corner--br" />
              <span className="about-photo-label">{about.portraitCaption}</span>
              <span className="about-photo-index">PORTRAIT / 01</span>
            </div>

            <div className="about-stamp" aria-label="Open to work · Wuhan · 2026">
              <span className="stamp-star">✦</span>
              <strong>OPEN<br />TO WORK</strong>
              <small>WUHAN · 2026</small>
            </div>

            <div className="about-now">
              <div className="about-now-head">
                <span className="now-dot" />
                <span>{about.now.label}</span>
                <span className="about-now-rule" />
                <span>2024.03 — NOW</span>
              </div>
              <strong>{about.now.company}</strong>
              <span className="about-now-role">{about.now.role}</span>
              <p>{about.now.text}</p>
              <ArrowUpRight size={18} className="about-now-arrow" />
            </div>
          </div>

          <div className="about-copy">
            <h3 className="about-heading" id="about-heading" data-reveal>
              {headingLines.map((line, index) => (
                <span key={line} style={{ transitionDelay: `${index * 90}ms` }}>
                  {line}
                </span>
              ))}
            </h3>
            <p className="about-lede" data-reveal>
              {about.lede}
            </p>
            <div className="about-paragraphs" data-reveal>
              {about.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="about-principles" data-reveal>
              {about.principles.map((principle) => (
                <div className="principle" key={principle.no}>
                  <span className="principle-no">{principle.no}</span>
                  <div>
                    <h4>{principle.title}</h4>
                    <p>{principle.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="skills-block" data-reveal>
          <div className="skills-head">
            <span className="section-label compact">
              <span className="section-no">↳</span>
              <span>CAPABILITIES</span>
              <span className="section-line" />
            </span>
            <span>能力矩阵 / 8 YEARS OF PRACTICE</span>
          </div>
          <div className="skills-grid">
            {skills.map((group) => (
              <div className="skill-group" key={group.title}>
                <div className="skill-group-head">
                  <span>{group.title}</span>
                  <small>{group.titleEn}</small>
                </div>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
