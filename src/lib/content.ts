// src/lib/content.ts
import fs from 'fs'
import path from 'path'
import type {
  NavConfig, SiteConfig, ServicesContent,
  TeamMember, TeamMemberDetail, FaqItem, Award, Milestone, CareerOpening, HomeContent, AboutContent
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

export function getHomeContent(): HomeContent {
  return readJson<HomeContent>('home.json')
}

export function getAboutContent(): AboutContent {
  return readJson<AboutContent>('about.json')
}

export function getServices(): ServicesContent {
  return readJson<ServicesContent>('services.json')
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

export function getAwards(): Award[] {
  return readJson<Award[]>('awards.json')
}

export function getMilestones(): Milestone[] {
  return readJson<Milestone[]>('milestones.json')
}

export function getCareerOpenings(): CareerOpening[] {
  return readJson<CareerOpening[]>('careers.json')
}
