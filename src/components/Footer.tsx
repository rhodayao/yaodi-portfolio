import { useContent } from '../context/ContentContext'
import { useLocalTime, useReducedMotion } from '../hooks/useSite'
import { ArrowUpRight, MapPin } from './Icons'

export function Footer() {
  const { content } = useContent()
  const { site, contact } = content
  const time = useLocalTime()
  const reduced = useReducedMotion()

  function toTop() {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-mark">
          YD<sup>®</sup>
        </div>
        <button className="back-top" type="button" onClick={toTop} data-cursor="TOP">
          <span>BACK TO TOP</span>
          <ArrowUpRight size={18} />
        </button>
      </div>

      <div className="footer-grid">
        <div className="footer-col footer-col--wide">
          <span className="micro-label">ELSEWHERE</span>
          <a href={site.zcool} target="_blank" rel="noreferrer">
            站酷 / ZCOOL <ArrowUpRight size={14} />
          </a>
          <a href={`mailto:${site.email}`}>
            EMAIL <ArrowUpRight size={14} />
          </a>
        </div>
        <div className="footer-col">
          <span className="micro-label">CONTACT</span>
          <a href={`tel:${site.phone.replace(/-/g, '')}`}>{site.phone}</a>
          <span>{site.email}</span>
        </div>
        <div className="footer-col">
          <span className="micro-label">LOCATION</span>
          <span className="footer-location">
            <MapPin size={14} /> {contact.footerNote}
          </span>
          <span>LOCAL {time} CST</span>
        </div>
        <div className="footer-col">
          <span className="micro-label">STATUS</span>
          <span className="footer-status">
            <i /> {site.status}
          </span>
          <span>{site.availability}</span>
        </div>
      </div>

      <div className="footer-bottom">
        <span>{contact.copyright}</span>
        <span className="footer-built">{contact.builtWith}</span>
        <span>NO COOKIES · NO TRACKING</span>
      </div>
    </footer>
  )
}
