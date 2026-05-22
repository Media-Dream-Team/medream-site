// src/components/home/ContactFormSection.tsx
import { Suspense } from 'react'
import type { Service } from '@/types/content'
import { ContactForm } from '@/components/shared/ContactForm'

interface Props {
  services: Service[]
  locale: string
}

export function ContactFormSection({ services, locale }: Props) {
  const l = locale as 'th' | 'en'
  return (
    <section id="contact-form" className="py-20 px-4 bg-deep-space/30">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-dawn-gold mb-3 text-center">
          {l === 'th' ? 'ติดต่อเรา' : 'Contact Us'}
        </h2>
        <p className="text-horizon text-center mb-10">
          {l === 'th'
            ? 'กรอกข้อมูลเพื่อให้เราติดต่อกลับ'
            : "Fill in the form and we'll get back to you"}
        </p>
        <Suspense>
          <ContactForm services={services} />
        </Suspense>
      </div>
    </section>
  )
}
