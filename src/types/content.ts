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

export interface ServiceFaqItem {
  question_th: string
  question_en: string
  answer_th: string
  answer_en: string
}

export type ServiceGroupId = 'marketing-event' | 'crm' | 'learning' | 'games'

export interface ServiceGroup {
  id: ServiceGroupId
  title_th: string
  title_en: string
  forWho_th: string
  forWho_en: string
  body_th: string
  body_en: string
  bullets_th: string[]
  bullets_en: string[]
  hasCases: boolean
  faq: ServiceFaqItem[]
}

export interface CraftItem {
  label_th: string
  label_en: string
}

export interface ServicesContent {
  groups: ServiceGroup[]
  craft: CraftItem[]
}

export interface PortfolioItem {
  id: string
  title_th: string
  title_en: string
  type: 'own-ip' | 'client'
  featured: boolean
  image: string
  tags: string[]
  category: ServiceGroupId | null
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
  category?: 'general' | 'marketing-event' | 'crm' | 'learning' | 'games'
}

export interface Award {
  name_th: string
  name_en: string
  year: number
  event: string
  image: string
}

export interface Milestone {
  date_th: string
  date_en: string
  event_th: string
  event_en: string
  location_th: string
  location_en: string
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

export interface WorkTeaser {
  id: string
  title_th: string
  title_en: string
  desc_th: string
  desc_en: string
  image: string
}

export interface HomeServicePreview {
  id: 'marketing-event' | 'crm' | 'learning' | 'games'
  title_th: string
  title_en: string
  body_th: string
  body_en: string
  cta_th: string
  cta_en: string
}

export interface HomeFaqPreviewItem {
  question_th: string
  question_en: string
  answer_th: string
  answer_en: string
}

export interface HomeWayOfWorkStep {
  level: number
  label_th: string
  label_en: string
  desc_th: string
  desc_en: string
}

export interface HomeDreamPhotoCaption {
  caption_th: string
  caption_en: string
}

export interface HomeTrustedByItem {
  label_th: string
  label_en: string
}

export interface HomeContent {
  hero: {
    subheadline_th: string
    subheadline_en: string
  }
  dream: {
    headline: string
    body_th: string
    body_en: string
    dna: string[]
    photoCaptions: HomeDreamPhotoCaption[]
  }
  services: {
    headline: string
    subheadline_th: string
    subheadline_en: string
    cards: HomeServicePreview[]
  }
  difference: {
    headline: string
    body_th: string
    body_en: string
    microProofNumber: string
    microProof_th: string
    microProof_en: string
  }
  works: {
    headline_th: string
    headline_en: string
    teasers: WorkTeaser[]
    cta_th: string
    cta_en: string
  }
  trustedBy: {
    headline_th: string
    headline_en: string
    clientsCaption_th: string
    clientsCaption_en: string
    awardsCaption_th: string
    awardsCaption_en: string
    eventsCaption_th: string
    eventsCaption_en: string
    extraClients: HomeTrustedByItem[]
  }
  wayOfWork: {
    headline_th: string
    headline_en: string
    steps: HomeWayOfWorkStep[]
    cta_th: string
    cta_en: string
  }
  faqPreview: {
    headline_th: string
    headline_en: string
    items: HomeFaqPreviewItem[]
    cta_th: string
    cta_en: string
  }
  finalCta: {
    headline_th: string
    headline_en: string
    subheadline_th: string
    subheadline_en: string
    cta_th: string
    cta_en: string
  }
}

export interface AboutStorySection {
  heading_th: string
  heading_en: string
  body_th: string
  body_en: string
}

export interface AboutContent {
  story: AboutStorySection[]
  dna: {
    headline_th: string
    headline_en: string
    traits: string[]
  }
}
