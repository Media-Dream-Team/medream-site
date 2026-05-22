// src/lib/content.ts
import fs from 'fs'
import path from 'path'
import type {
  NavConfig, SiteConfig, Service, PortfolioItem,
  TeamMember, TeamMemberDetail, FaqItem, BlogPost, Award, CareerOpening
} from '@/types/content'

function readJson<T>(relativePath: string): T {
  const filePath = path.join(process.cwd(), 'content', relativePath)
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as T
}

export function getNavConfig(): NavConfig {
  return readJson<NavConfig>('nav.json')
}

export function getSiteConfig(): SiteConfig {
  return readJson<SiteConfig>('site.json')
}

export function getServices(): Service[] {
  return readJson<Service[]>('services.json')
}

export function getPortfolioItems(): PortfolioItem[] {
  return readJson<PortfolioItem[]>('portfolio.json')
}

export function getFeaturedPortfolio(): PortfolioItem[] {
  return getPortfolioItems().filter(p => p.featured)
}

export function getTeamMembers(): TeamMember[] {
  return readJson<TeamMember[]>('team.json')
}

export function getTeamMemberDetail(slug: string): TeamMemberDetail | null {
  const filePath = path.join(process.cwd(), 'content', 'team', `${slug}.json`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as TeamMemberDetail
}

export function getFaqItems(): FaqItem[] {
  return readJson<FaqItem[]>('faq.json')
}

export function getFeaturedFaq(): FaqItem[] {
  return getFaqItems().filter(f => f.featured).slice(0, 8)
}

export function getBlogPosts(): BlogPost[] {
  return readJson<BlogPost[]>('blog.json')
}

export function getBlogPost(slug: string): BlogPost | null {
  return getBlogPosts().find(p => p.slug === slug) ?? null
}

export function getAwards(): Award[] {
  return readJson<Award[]>('awards.json')
}

export function getCareerOpenings(): CareerOpening[] {
  return readJson<CareerOpening[]>('careers.json')
}
