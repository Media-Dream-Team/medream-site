// src/app/[locale]/contact/page.tsx
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getServices } from '@/lib/content'
import { ContactForm } from '@/components/shared/ContactForm'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return { title: locale === 'th' ? 'ติดต่อเรา' : 'Contact' }
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const l = locale as 'th' | 'en'
  const services = getServices()

  return (
    <div className="pt-16">
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-dawn-gold mb-4">
            {l === 'th' ? 'ติดต่อเรา' : 'Contact Us'}
          </h1>
          <p className="text-horizon mb-12">
            {l === 'th'
              ? 'กรอกข้อมูลเพื่อให้เราติดต่อกลับโดยเร็ว'
              : "Fill in the form and we'll get back to you shortly"}
          </p>
          <Suspense>
            <ContactForm services={services} />
          </Suspense>
        </div>
      </section>
    </div>
  )
}
