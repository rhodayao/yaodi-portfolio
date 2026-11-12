import { Link } from 'react-router-dom'
import { ArrowLeft } from '../components/Icons'

export function NotFound() {
  return (
    <section className="not-found">
      <div className="not-found-grid" aria-hidden="true" />
      <span className="not-found-code">404</span>
      <div className="not-found-copy">
        <span className="micro-label">PAGE NOT FOUND</span>
        <h1>这个页面，还没有被设计出来。</h1>
        <p>链接可能已经移动，或者项目正在更新中。</p>
        <Link to="/" className="pill-button">
          <span>返回首页</span>
          <span className="pill-icon">
            <ArrowLeft size={17} />
          </span>
        </Link>
      </div>
    </section>
  )
}
