import { useState } from 'react'
import { useContent } from '../context/ContentContext'
import { ArrowUpRight, Check, Copy, Mail, Phone } from './Icons'

export function ContactSection() {
  const { content } = useContent()
  const { site, contact } = content
  const [copied, setCopied] = useState(false)
  const headingLines = contact.heading.split('\n')

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(contact.email)
    } catch {
      const helper = document.createElement('textarea')
      helper.value = contact.email
      document.body.appendChild(helper)
      helper.select()
      document.execCommand('copy')
      helper.remove()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <section className="contact-section section" id="contact" aria-labelledby="contact-heading">
      <div className="contact-glow" aria-hidden="true" />
      <div className="contact-grid-bg" aria-hidden="true" />

      <div className="section-shell contact-shell">
        <div className="contact-head" data-reveal>
          <div className="section-label">
            <span className="section-no">04</span>
            <span>CONTACT / 联系</span>
            <span className="section-line" />
            <span className="section-meta">WUHAN · CHINA</span>
          </div>
          <span className="contact-availability">
            <i />
            {site.status} · {site.availability}
          </span>
        </div>

        <div className="contact-main">
          <div className="contact-heading-wrap" data-reveal>
            <span className="contact-heading-en" aria-hidden="true">
              {contact.headingEn}
            </span>
            <h2 className="contact-heading" id="contact-heading">
              {headingLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h2>
          </div>

          <div className="contact-aside" data-reveal>
            <p>{contact.body}</p>
            <a className="contact-email" href={`mailto:${contact.email}`} data-cursor="MAIL">
              <span>{contact.email}</span>
              <ArrowUpRight size={26} />
            </a>
            <button type="button" className="copy-email" onClick={copyEmail}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? '已复制邮箱' : '复制邮箱地址'}
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {copied ? '邮箱已复制' : ''}
            </span>
          </div>
        </div>

        <div className="contact-details" data-reveal>
          <a href={`mailto:${site.email}`} className="contact-detail">
            <span className="contact-detail-icon">
              <Mail size={18} />
            </span>
            <span>
              <small>EMAIL</small>
              {site.email}
            </span>
          </a>
          <a href={`tel:${site.phone.replace(/-/g, '')}`} className="contact-detail">
            <span className="contact-detail-icon">
              <Phone size={18} />
            </span>
            <span>
              <small>PHONE / WECHAT</small>
              {site.phone}
            </span>
          </a>
          <a
            href={site.zcool}
            target="_blank"
            rel="noreferrer"
            className="contact-detail"
          >
            <span className="contact-detail-icon">Z</span>
            <span>
              <small>ZCOOL / 站酷</small>
              zcool.com.cn/u/15616436
            </span>
          </a>
          <div className="contact-detail contact-detail--static">
            <span className="contact-detail-icon">◎</span>
            <span>
              <small>LOCATION</small>
              {contact.footerNote}
            </span>
          </div>
        </div>

        <div className="contact-note" data-reveal>
          <span>通常会在 24 小时内回复</span>
          <span className="contact-note-line" />
          <span>{contact.ctaLabel} → {contact.email}</span>
        </div>
      </div>
    </section>
  )
}
