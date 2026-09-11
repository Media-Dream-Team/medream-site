// src/components/layout/Footer.tsx
import Link from 'next/link'
import Image from 'next/image'
import type { SiteConfig } from '@/types/content'

interface Props {
  site: SiteConfig
  locale: string
}

export function Footer({ site, locale }: Props) {
  const l = locale as 'th' | 'en'

  return (
    <footer className="bg-midnight border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div>
            <Image
              src="/images/logo/logo-white.png"
              alt="MeDream Studio"
              width={48}
              height={48}
              className="mb-3 object-contain"
            />
            <p className="text-mist text-sm leading-relaxed max-w-xs">
              {l === 'th' ? site.tagline_th : site.tagline_en}
            </p>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-4">
            <Link
              href={`/${locale}/careers`}
              className="text-white hover:text-first-light text-sm font-display font-semibold transition-colors"
            >
              {l === 'th' ? 'ร่วมงานกับเรา' : 'Careers'}
            </Link>
            <Link
              href={`/${locale}/faq`}
              className="text-white hover:text-first-light text-sm font-display font-semibold transition-colors"
            >
              FAQ
            </Link>
            {site.socials.map(s => (
              <a
                key={s.platform}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-first-light text-sm font-display font-semibold transition-colors"
              >
                {s.platform}
              </a>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-mist text-xs">
            {l === 'th' ? site.copyright_th : site.copyright_en}
          </p>
        </div>
      </div>
    </footer>
  )
}
