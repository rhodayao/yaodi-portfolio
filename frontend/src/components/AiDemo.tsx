import { useEffect, useRef, useState } from 'react'
import type { Project } from '../types'
import { useInView } from '../hooks/useInView'
import { useReducedMotion } from '../hooks/useSite'
import { ArrowUpRight, Spark } from './Icons'

const ANSWER =
  '近三年发行规模持续上升，2025 年到期压力集中在一季度。已按「城投债」口径过滤，并剔除 3 条非公开发行记录。建议继续关注 Q1 的再融资窗口。'

const SQL = `SELECT
  YEAR(issue_date) AS year,
  SUM(amount) AS total_issued,
  SUM(maturity_amount) AS maturity
FROM finance.bond_issuance
WHERE bond_type = '城投债'
  AND issue_date >= '2023-01-01'
GROUP BY YEAR(issue_date)
ORDER BY year ASC;`

const TABLE_ROWS = [
  ['2023', '386.20', '94.60', '城投债'],
  ['2024', '421.80', '102.40', '城投债'],
  ['2025', '476.00', '312.00', '城投债'],
]

type Tab = 'insight' | 'sql' | 'detail'

export function AiDemo({ project }: { project: Project }) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const reduced = useReducedMotion()
  const [typed, setTyped] = useState('')
  const [tab, setTab] = useState<Tab>('insight')
  const [run, setRun] = useState(0)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    if (!inView) return
    if (reduced) {
      setTyped(ANSWER)
      return
    }
    setTyped('')
    let index = 0
    timer.current = window.setInterval(() => {
      index += 1
      setTyped(ANSWER.slice(0, index))
      if (index >= ANSWER.length && timer.current) {
        window.clearInterval(timer.current)
        timer.current = null
      }
    }, 18)
    return () => {
      if (timer.current) window.clearInterval(timer.current)
    }
  }, [inView, reduced, run])

  const typing = typed.length < ANSWER.length

  function replay() {
    if (timer.current) window.clearInterval(timer.current)
    setTyped('')
    setTab('insight')
    setRun((value) => value + 1)
  }

  return (
    <div
      className="ai-demo"
      ref={ref}
      style={{ ['--project-accent' as string]: project.accent }}
      data-reveal
    >
      <div className="ai-demo-header">
        <div>
          <span className="section-label compact">
            <span className="section-no">↳</span>
            <span>INTERACTIVE CONCEPT</span>
            <span className="section-line" />
          </span>
          <h3>把 AI 的答案，拆开给你看。</h3>
        </div>
        <div className="ai-demo-copy">
          <p>
            点击「SQL」查看生成过程，切换「明细」回到原始数据。这是我在金融 AI
            产品里坚持的可解释性设计：结论、依据与来源，始终在同一屏内。
          </p>
          <button type="button" className="ai-replay" onClick={replay}>
            <Spark size={15} />
            重新演示
          </button>
        </div>
      </div>

      <div className="ai-window">
        <div className="ai-window-bar">
          <div className="ai-window-dots">
            <span />
            <span />
            <span />
          </div>
          <div className="ai-window-url">
            <span className="secure-dot" />
            bowen.ai / analyst / new
          </div>
          <span className="ai-window-badge">DEMO</span>
        </div>

        <div className="ai-window-body">
          <aside className="ai-window-side" aria-hidden="true">
            <div className="ai-window-brand">
              <span>B</span>
              <div>
                博闻智数
                <small>FINANCE AI</small>
              </div>
            </div>
            <span className="ai-side-label">WORKSPACE</span>
            <div className="ai-window-nav is-active">
              <span>✦</span> 智能问数
            </div>
            <div className="ai-window-nav">
              <span>▤</span> 数据资产
            </div>
            <div className="ai-window-nav">
              <span>◎</span> 分析报告
            </div>
            <div className="ai-window-nav">
              <span>⌁</span> 口径管理
            </div>
            <span className="ai-side-label">DATA SOURCE</span>
            <div className="ai-source">
              <span className="source-dot" />
              银行经营数据仓
              <small>已同步 · 12 min ago</small>
            </div>
            <div className="ai-source">
              <span className="source-dot" />
              债券发行明细
              <small>已同步 · 1 h ago</small>
            </div>
            <div className="ai-side-permission">
              <span>◈</span>
              当前权限：分析师
              <small>3 个字段自动脱敏</small>
            </div>
          </aside>

          <div className="ai-window-main">
            <header className="ai-window-head">
              <div>
                <span className="ai-eyebrow">NEW ANALYSIS / 05</span>
                <h4>城投债发行与到期压力</h4>
              </div>
              <div className="ai-head-actions">
                <span className="ai-live">
                  <i /> 已校验
                </span>
                <span className="ai-avatar">YD</span>
              </div>
            </header>

            <div className="ai-thread">
              <div className="ai-question">
                <span className="ai-user">YD</span>
                <p>对比近三年城投债发行规模与到期压力，重点看 2025 年。</p>
              </div>

              <div className="ai-response">
                <div className="ai-response-head">
                  <span className="ai-response-avatar">✦</span>
                  <div>
                    <strong>博闻 AI</strong>
                    <span>基于银行经营数据仓 · 2.4s</span>
                  </div>
                  <span className="ai-response-tag">已校验口径</span>
                </div>
                <p className="ai-answer-text">
                  {typed}
                  {typing ? <span className="typing-caret" /> : null}
                </p>

                {!typing ? (
                  <div className="ai-tabs" role="tablist" aria-label="答案视图">
                    {(
                      [
                        ['insight', '洞察'],
                        ['sql', 'SQL'],
                        ['detail', '明细'],
                      ] as [Tab, string][]
                    ).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        role="tab"
                        aria-selected={tab === key}
                        className={tab === key ? 'is-active' : ''}
                        onClick={() => setTab(key)}
                      >
                        {label}
                      </button>
                    ))}
                    <span className="ai-tabs-hint">可解释性视图</span>
                  </div>
                ) : null}

                {!typing && tab === 'insight' ? (
                  <div className="ai-insight" role="tabpanel">
                    <div className="ai-insight-metrics">
                      <div>
                        <small>累计发行规模</small>
                        <strong>1,284.00<em>亿元</em></strong>
                        <span>同比 +18.6%</span>
                      </div>
                      <div>
                        <small>2025 到期规模</small>
                        <strong>312.00<em>亿元</em></strong>
                        <span className="is-warn">Q1 占 61%</span>
                      </div>
                      <div>
                        <small>覆盖主体</small>
                        <strong>47<em>家</em></strong>
                        <span>已去重</span>
                      </div>
                    </div>
                    <div className="ai-chart-large" aria-hidden="true">
                      <div className="chart-head">
                        <span>发行规模 / 亿元</span>
                        <span>2023 — 2025</span>
                      </div>
                      <div className="chart-bars">
                        {[
                          ['2023', 46, '386'],
                          ['2024', 67, '422'],
                          ['2025', 92, '476'],
                          ['2026 Q1', 61, '312'],
                        ].map(([label, height, value]) => (
                          <div className="chart-bar" key={label}>
                            <span className="chart-value">{value}</span>
                            <i style={{ height: `${height}%` }} />
                            <small>{label}</small>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="ai-source-note">
                      <span>来源</span> finance.bond_issuance · 已按「城投债」口径过滤
                      <button type="button" onClick={() => setTab('sql')}>
                        查看生成 SQL <ArrowUpRight size={13} />
                      </button>
                    </div>
                  </div>
                ) : null}

                {!typing && tab === 'sql' ? (
                  <div className="ai-sql" role="tabpanel">
                    <div className="ai-sql-head">
                      <span>SQL GENERATED</span>
                      <span className="ai-sql-ok">✓ 语法检查通过</span>
                    </div>
                    <pre>
                      <code>{SQL}</code>
                    </pre>
                    <div className="ai-sql-foot">
                      <span>自动附带口径说明 · 不直接执行写操作</span>
                      <button type="button" onClick={() => setTab('detail')}>
                        看结果明细
                      </button>
                    </div>
                  </div>
                ) : null}

                {!typing && tab === 'detail' ? (
                  <div className="ai-table-wrap" role="tabpanel">
                    <table className="ai-table">
                      <thead>
                        <tr>
                          <th>年度</th>
                          <th>发行规模 / 亿</th>
                          <th>到期规模 / 亿</th>
                          <th>口径</th>
                        </tr>
                      </thead>
                      <tbody>
                        {TABLE_ROWS.map((row) => (
                          <tr key={row[0]}>
                            {row.map((cell) => (
                              <td key={cell}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="ai-table-foot">
                      <span>展示 3 / 3 条聚合结果</span>
                      <span>导出 Excel</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="ai-composer-large">
              <span className="ai-composer-icon">↗</span>
              <span className="ai-composer-placeholder">继续追问，或换一个问题试试…</span>
              <span className="ai-composer-context">上下文 2 轮</span>
              <button type="button" aria-label="发送" tabIndex={-1}>
                ↑
              </button>
            </div>
            <p className="ai-disclaimer">交互概念示意 · 数据为演示数据</p>
          </div>
        </div>
      </div>
    </div>
  )
}
