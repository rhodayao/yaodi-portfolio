import type { ReactNode } from 'react'

type SectionHeadProps = {
  no: string
  label: string
  title: string
  titleEn: string
  note?: ReactNode
  align?: 'left' | 'right'
}

export function SectionHead({ no, label, title, titleEn, note, align = 'left' }: SectionHeadProps) {
  return (
    <header className={`section-head section-head--${align}`} data-reveal>
      <div className="section-label">
        <span className="section-no">{no}</span>
        <span>{label}</span>
        <span className="section-line" />
      </div>
      <div className="section-title-row">
        <h2 className="section-title">
          <span className="section-title-cn">{title}</span>
          <span className="section-title-en">{titleEn}</span>
        </h2>
        {note ? <div className="section-note">{note}</div> : null}
      </div>
    </header>
  )
}
