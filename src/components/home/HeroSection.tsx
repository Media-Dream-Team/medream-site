'use client'
import { useCallback, useMemo } from 'react'
import Particles, { ParticlesProvider } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import type { Engine, ISourceOptions } from '@tsparticles/engine'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import type { SiteConfig } from '@/types/content'

interface Props {
  site: SiteConfig
}

function HeroContent({ site }: Props) {
  const locale = useLocale()
  const t = useTranslations('hero')

  const options: ISourceOptions = useMemo(
    () => ({
      background: { color: { value: 'transparent' } },
      fpsLimit: 60,
      particles: {
        number: { value: 60, density: { enable: true } },
        color: { value: ['#ECC842', '#3D6EE8', '#8FA8E8'] },
        opacity: {
          value: { min: 0.1, max: 0.5 },
          animation: { enable: true, speed: 0.5 },
        },
        size: { value: { min: 1, max: 3 } },
        move: {
          enable: true,
          speed: 0.4,
          direction: 'none',
          random: true,
          outModes: { default: 'out' },
        },
        links: { enable: false },
      },
      detectRetina: true,
      responsive: [
        {
          maxWidth: 768,
          options: {
            particles: { number: { value: 30 } },
          },
        },
      ],
    }),
    [],
  )

  const l = locale as 'th' | 'en'

  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-midnight">
      {/* Dawn glow from bottom */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 40% at 50% 110%, rgba(23,64,176,0.35) 0%, transparent 70%)',
        }}
      />

      {/* Particles */}
      <Particles
        id="hero-particles"
        options={options}
        className="absolute inset-0"
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl xl:text-6xl font-black text-dream-cream mb-4 leading-tight">
          {l === 'th' ? site.tagline_th : site.tagline_en}
        </h1>
        <p className="text-horizon text-lg md:text-xl mb-10 font-light">
          {site.name}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/${locale}/portfolio`}
            className="px-8 py-3 bg-royal-blue hover:bg-electric text-white font-bold rounded transition-colors text-center"
          >
            {t('cta_portfolio')}
          </Link>
          <a
            href="#contact-form"
            className="px-8 py-3 border-2 border-dawn-gold text-dawn-gold hover:bg-dawn-gold hover:text-midnight font-bold rounded transition-colors text-center"
          >
            {t('cta_contact')}
          </a>
        </div>
      </div>
    </section>
  )
}

export function HeroSection({ site }: Props) {
  const particlesInit = useCallback(async (engine: Engine): Promise<void> => {
    await loadSlim(engine)
  }, [])

  return (
    <ParticlesProvider init={particlesInit}>
      <HeroContent site={site} />
    </ParticlesProvider>
  )
}
