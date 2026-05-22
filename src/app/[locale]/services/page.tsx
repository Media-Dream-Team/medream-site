// src/app/[locale]/services/page.tsx
import type { Metadata } from 'next'
import { getServices } from '@/lib/content'
import { ServiceCard } from '@/components/shared/ServiceCard'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return { title: locale === 'th' ? 'บริการ' : 'Services' }
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const l = locale as 'th' | 'en'
  const services = getServices()

  return (
    <div className="pt-16">
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-dawn-gold mb-4">
            {l === 'th' ? 'บริการของเรา' : 'Our Services'}
          </h1>
          <p className="text-horizon text-lg mb-12">
            {l === 'th'
              ? 'เราพร้อมสร้างประสบการณ์ดิจิทัลที่เหมาะกับแบรนด์ของคุณ'
              : 'We create digital experiences tailored to your brand'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {services.map(service => (
              <ServiceCard key={service.id} service={service} locale={locale} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
