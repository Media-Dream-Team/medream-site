// src/types/content.ts

export interface NavItem {
  key: string
  href: string
  label_th: string
  label_en: string
}

export interface NavConfig {
  items: NavItem[]
}

export interface PipelineStep {
  label_th: string
  label_en: string
  icon: string
}

export interface SocialLink {
  platform: string
  url: string
  icon: string
}

export interface SiteConfig {
  name: string
  tagline_th: string
  tagline_en: string
  vision_th: string
  vision_en: string
  mission_th: string
  mission_en: string
  intro_th: string
  intro_en: string
  history_th: string
  history_en: string
  pipeline: PipelineStep[]
  socials: SocialLink[]
  email: string
  phone: string
  copyright_th: string
  copyright_en: string
}

export interface Service {
  id: string
  icon: string
  title_th: string
  title_en: string
  desc_th: string
  desc_en: string
  cta_th: string
  cta_en: string
}

export interface PortfolioItem {
  id: string
  title_th: string
  title_en: string
  type: 'own-ip' | 'client'
  featured: boolean
  image: string
  tags: string[]
  year: number
  desc_th: string
  desc_en: string
  url?: string
}

export interface TeamMember {
  name: string
  role_th: string
  role_en: string
  photo: string
  slug: string
}

export interface TeamMemberWork {
  title: string
  image: string
  desc_th: string
  desc_en: string
  year: number
}

export interface TeamMemberDetail {
  name: string
  role_th: string
  role_en: string
  photo: string
  bio_th: string
  bio_en: string
  skills: string[]
  works: TeamMemberWork[]
}

export interface FaqItem {
  question_th: string
  question_en: string
  answer_th: string
  answer_en: string
  featured: boolean
}

export interface BlogPost {
  slug: string
  title_th: string
  title_en: string
  date: string
  excerpt_th: string
  excerpt_en: string
  body_th: string
  body_en: string
  tags: string[]
  image: string
}

export interface Award {
  name_th: string
  name_en: string
  year: number
  event: string
  image: string
}

export interface CareerOpening {
  id: string
  title_th: string
  title_en: string
  type: 'full-time' | 'freelance' | 'intern'
  desc_th: string
  desc_en: string
  open: boolean
}
