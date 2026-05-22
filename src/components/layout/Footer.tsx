// src/components/layout/Footer.tsx
import Link from 'next/link'
import Image from 'next/image'
import type { SiteConfig, NavItem } from '@/types/content'

interface Props {
  site: SiteConfig
  navItems: NavItem[]
  locale: string
}

export function Footer({ site, navItems, locale }: Props) {
  const l = locale as 'th' | 'en'

  return (
    <footer className="bg-deep-space border-t border-nebula mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Image
              src="/images/logo/logo-color.png"
              alt="MeDream Studio"
              width={48}
              height={48}
              className="mb-3 object-contain"
            />
            <p className="text-horizon text-sm leading-relaxed">
              {l === 'th' ? site.tagline_th : site.tagline_en}
            </p>
          </div>

          {/* Quick nav */}
          <div>
            <h3 className="text-dawn-gold font-bold mb-3 text-sm uppercase tracking-wider">
              {l === 'th' ? 'เมนู' : 'Navigation'}
            </h3>
            <ul className="flex flex-col gap-2">
              {navItems.map(item => (
                <li key={item.key}>
                  <Link
                    href={`/${locale}${item.href}`}
                    className="text-horizon hover:text-dream-cream text-sm transition-colors"
                  >
                    {l === 'th' ? item.label_th : item.label_en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social + Contact */}
          <div>
            <h3 className="text-dawn-gold font-bold mb-3 text-sm uppercase tracking-wider">
              {l === 'th' ? 'ติดตามเรา' : 'Follow Us'}
            </h3>
            <ul className="flex flex-col gap-2">
              {site.socials.map(s => (
                <li key={s.platform}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-horizon hover:text-dream-cream text-sm transition-colors"
                  >
                    {s.platform}
                  </a>
                </li>
              ))}
            </ul>
            {site.email && (
              <p className="text-horizon text-sm mt-3">
                <a href={`mailto:${site.email}`} className="hover:text-dream-cream transition-colors">
                  {site.email}
                </a>
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-nebula pt-6 text-center">
          <p className="text-horizon text-xs">
            {l === 'th' ? site.copyright_th : site.copyright_en}
          </p>
        </div>
      </div>
    </footer>
  )
}
