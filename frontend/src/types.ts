export type Stat = {
  value: number
  suffix: string
  label: string
  note: string
}

export type Principle = {
  no: string
  title: string
  body: string
}

export type SkillGroup = {
  title: string
  titleEn: string
  items: string[]
}

export type Experience = {
  company: string
  role: string
  period: string
  current: boolean
  summary: string
  highlights: string[]
  tags: string[]
}

export type ProjectSection = {
  no: string
  title: string
  titleEn: string
  body: string
  image: string
  caption: string
  layout: 'text' | 'image' | 'split'
}

export type Metric = {
  value: string
  label: string
}

export type GalleryItem = {
  src: string
  caption: string
}

export type Project = {
  slug: string
  order: number
  featured: boolean
  title: string
  titleEn: string
  subtitle: string
  category: string
  categoryEn: string
  year: string
  role: string
  duration: string
  client: string
  team: string
  cover: string
  coverAlt: string
  coverStyle: 'image' | 'ai' | string
  accent: string
  showcase: string
  summary: string
  intro: string
  challenge: string
  approach: string
  metrics: Metric[]
  sections: ProjectSection[]
  gallery: GalleryItem[]
}

export type SiteContent = {
  updatedAt: string
  site: {
    name: string
    nameEn: string
    title: string
    years: number
    tagline: string
    intro: string
    location: string
    status: string
    availability: string
    email: string
    phone: string
    wechat: string
    zcool: string
    resumeUrl: string
    hero: {
      kicker: string
      heading: string
      note: string
      primaryCta: string
      secondaryCta: string
    }
    stats: Stat[]
  }
  about: {
    eyebrow: string
    heading: string
    lede: string
    paragraphs: string[]
    portrait: string
    portraitAlt: string
    portraitCaption: string
    principles: Principle[]
    now: {
      label: string
      company: string
      role: string
      text: string
    }
  }
  skills: SkillGroup[]
  experiences: Experience[]
  projects: Project[]
  contact: {
    eyebrow: string
    heading: string
    headingEn: string
    body: string
    ctaLabel: string
    email: string
    footerNote: string
    copyright: string
    builtWith: string
  }
}
