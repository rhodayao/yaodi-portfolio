import type { Project } from '../types'

type AiCoverProps = {
  project: Project
  compact?: boolean
}

const bars = [
  { year: '2023', value: 46 },
  { year: '2024', value: 66 },
  { year: '2025', value: 92 },
  { year: '2026', value: 74 },
]

export function AiCover({ project, compact = false }: AiCoverProps) {
  return (
    <div
      className={`ai-cover ${compact ? 'is-compact' : ''}`}
      style={{ ['--project-accent' as string]: project.accent }}
      role="img"
      aria-label={project.coverAlt}
    >
      <div className="ai-cover-chrome">
        <div className="ai-cover-dots">
          <span />
          <span />
          <span />
        </div>
        <div className="ai-cover-url">bowen.ai / intelligence / query</div>
        <div className="ai-cover-secure">合规模式</div>
      </div>

      <div className="ai-cover-app">
        <aside className="ai-cover-side">
          <div className="ai-cover-logo">
            <span className="ai-logo-mark">B</span>
            <div>
              博闻智数
              <small>FINANCE INTELLIGENCE</small>
            </div>
          </div>
          <div className="ai-side-cta">＋ 新建分析</div>
          <span className="ai-side-label">RECENT</span>
          <div className="ai-side-item is-active">近三年城投债趋势</div>
          <div className="ai-side-item">区域营收对比</div>
          <div className="ai-side-item">异常指标归因</div>
          <div className="ai-side-foot">
            <span className="ai-shield">✓</span>
            数据已脱敏
          </div>
        </aside>

        <div className="ai-cover-main">
          <div className="ai-cover-head">
            <div>
              <span className="ai-eyebrow">AI DATA ANALYST</span>
              <strong>今天想了解什么？</strong>
            </div>
            <span className="ai-model">BOWEN · V2.6</span>
          </div>

          <div className="ai-query">
            <span className="ai-query-mark">↗</span>
            <span>对比近三年城投债发行规模与到期压力</span>
            <kbd>↵</kbd>
          </div>

          <div className="ai-answer">
            <div className="ai-answer-meta">
              <span className="ai-spark">✦</span>
              <span>已解析 3 个指标 · 2 张数据表</span>
              <span className="ai-answer-time">2.4s</span>
            </div>
            <div className="ai-answer-grid">
              <div className="ai-metric">
                <small>累计发行</small>
                <strong>1,284<em>亿</em></strong>
                <span>↑ 18.6%</span>
              </div>
              <div className="ai-metric">
                <small>到期压力</small>
                <strong>312<em>亿</em></strong>
                <span>Q1 集中</span>
              </div>
              <div className="ai-chart" aria-hidden="true">
                {bars.map((bar) => (
                  <div className="ai-chart-col" key={bar.year}>
                    <span style={{ height: `${bar.value}%` }} />
                    <small>{bar.year}</small>
                  </div>
                ))}
              </div>
            </div>
            <div className="ai-explain">
              <span className="ai-explain-dot" />
              已校验口径 · 结果可追溯至 SQL
            </div>
          </div>

          <div className="ai-cover-lower">
            <div className="ai-cover-trace">
              <div className="ai-lower-label">
                DATA TRACE <span>可追溯</span>
              </div>
              <div className="ai-trace-row">
                <i />自然语言意图<span>已解析</span>
              </div>
              <div className="ai-trace-row">
                <i />指标口径 · 城投债<span>已校验</span>
              </div>
              <div className="ai-trace-row">
                <i />时间范围 · 2023 — 2025<span>已锁定</span>
              </div>
              <div className="ai-trace-row">
                <i />权限脱敏 · 3 个字段<span>已应用</span>
              </div>
              <div className="ai-trace-foot">
                <strong>92<em>%</em></strong>
                <span>可解释性评分<br />每一条结论均可回溯</span>
              </div>
            </div>
            <div className="ai-cover-sql">
              <div className="ai-lower-label">
                GENERATED SQL <span>只读</span>
              </div>
              <pre><code>WITH base AS (
  SELECT year, amount
  FROM finance.bond_issuance
  WHERE bond_type = '城投债'
    AND issue_date &gt;= '2023-01-01'
)
SELECT year, SUM(amount) AS total
FROM base
GROUP BY year
ORDER BY year;</code></pre>
              <div className="ai-sql-result">
                <span>2023</span><span>386.20 亿</span><i>已核对</i>
                <span>2025</span><span>476.00 亿</span><i>已核对</i>
              </div>
            </div>
          </div>

          <div className="ai-suggest-row">
            <span>继续追问</span>
            <i>按区域拆分</i>
            <i>对比去年同期</i>
            <i>生成分析报告</i>
          </div>

          <div className="ai-composer">
            <span>继续追问，例如「按区域拆分」</span>
            <span className="ai-send">↑</span>
          </div>
        </div>
      </div>
      <div className="ai-cover-glow" aria-hidden="true" />
      <div className="ai-cover-scan" aria-hidden="true" />
    </div>
  )
}
