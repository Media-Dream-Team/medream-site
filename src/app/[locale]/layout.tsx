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
  return {
    title: {
      default: site.name,
      template: `%s | ${site.name}`,
    },
    description: locale === 'th' ? site.tagline_th : site.tagline_en,
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

  return (
    <html lang={locale}>
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
