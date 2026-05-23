// src/app/[locale]/layout.tsx
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { getNavConfig, getSiteConfig } from '@/lib/content'
import { NavBar } from '@/components/layout/NavBar'
import { Footer } from '@/components/layout/Footer'
import { ScrollBackground } from '@/components/layout/ScrollBackground'
import '../globals.css'

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const site = getSiteConfig()
  const isTh = locale === 'th'
  const description = isTh ? site.tagline_th : site.tagline_en
  const url = 'https://medream-studio.com'

  return {
    title: {
      default: `${site.name} | Game Developer & Media Dream Team`,
      template: `%s | ${site.name}`,
    },
    description,
    keywords: isTh
      ? [
          'MeDream', 'MeDream Studio', 'Media Dream Team', 'มีเดียดรีม', 'มีดรีม',
          'รับทำเกม', 'พัฒนาเกม', 'สตูดิโอเกมไทย', 'ทีมพัฒนาเกมไทย',
          'Game Developer', 'Game Dev', 'Thai Game Studio', 'Thai Game Dev',
          'เกมดีเวลอปเปอร์', 'Unity Developer', 'Unity Dev Team', 'ยูนิตี้ดีเวลอปเปอร์',
          'AR VR', 'แอนิเมชัน', 'สตูดิโอเกม', 'Media Studio', 'Media Creator',
          'สื่อดิจิทัล', 'ครีเอทีฟสตูดิโอ',
        ]
      : [
          'MeDream', 'MeDream Studio', 'Media Dream Team',
          'Thai Game Studio', 'Thai Game Dev', 'Thailand Game Studio', 'Thailand Game Developer',
          'Game Developer', 'Game Dev', 'Game Development Studio',
          'Unity Developer', 'Unity Dev', 'Unity Dev Team',
          'Media Studio', 'Media Creator', 'Creative Studio Thailand',
          'AR VR', 'Animation Studio', 'Digital Media Studio',
        ],
    authors: [{ name: 'MeDream Studio' }],
    creator: 'MeDream Studio',
    metadataBase: new URL(url),
    alternates: {
      canonical: `${url}/${locale}`,
      languages: { th: `${url}/th`, en: `${url}/en` },
    },
    openGraph: {
      type: 'website',
      locale: isTh ? 'th_TH' : 'en_US',
      url,
      siteName: site.name,
      title: `${site.name} | Game Developer & Media Dream Team`,
      description,
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'MeDream Studio' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${site.name} | Game Developer`,
      description,
      creator: '@MeDreamStudio',
      images: ['/og-image.jpg'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'th' | 'en')) {
    notFound()
  }

  const messages = await getMessages()
  const nav = getNavConfig()
  const site = getSiteConfig()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MeDream Studio',
    alternateName: ['MeDream', 'Media Dream Team'],
    url: 'https://medream-studio.com',
    logo: 'https://medream-studio.com/images/logo/logo-color.png',
    description: locale === 'th' ? site.mission_th : site.mission_en,
    email: site.email,
    sameAs: site.socials.map(s => s.url),
  }

  return (
    <html lang={locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ScrollBackground />
          <NavBar items={nav.items} />
          <main>{children}</main>
          <Footer site={site} navItems={nav.items} locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
