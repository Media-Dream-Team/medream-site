import type { Service } from '@/types/content'
import { ServiceCard } from '@/components/shared/ServiceCard'

interface Props {
  services: Service[]
  locale: string
}

export function ServicesSection({ services, locale }: Props) {
  const l = locale as 'th' | 'en'
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-dawn-gold mb-10 text-center">
          {l === 'th' ? 'บริการของเรา' : 'Our Services'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {services.map(service => (
            <ServiceCard key={service.id} service={service} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  )
}
