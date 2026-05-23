// src/app/[locale]/contact/page.tsx
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getServices } from '@/lib/content'
import { ContactForm } from '@/components/shared/ContactForm'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isTh = locale === 'th'
  const title = isTh ? 'ติดต่อเรา | MeDream Studio' : 'Contact | MeDream Studio'
  const description = isTh
    ? 'ติดต่อ MeDream Studio เพื่อรับคำปรึกษาฟรี รับพัฒนาเกม แอนิเมชัน AR/VR และสื่อดิจิทัล'
    : 'Contact MeDream Studio for a free consultation on game development, animation, AR/VR and digital media production.'
  return {
    title,
    description,
    alternates: {
      canonical: `https://medream-studio.com/${locale}/contact`,
      languages: { th: 'https://medream-studio.com/th/contact', en: 'https://medream-studio.com/en/contact' },
    },
    keywords: isTh
      ? ['ติดต่อ MeDream', 'จ้างทำเกม', 'รับทำเกมราคา', 'Thai Game Studio ติดต่อ', 'Unity Dev รับจ้าง', 'Media Creator ติดต่อ']
      : ['Contact MeDream', 'Hire Game Developer', 'Thai Game Studio Contact', 'Unity Dev for Hire', 'Media Creator Contact'],
    openGraph: {
      title,
      description,
      url: `https://medream-studio.com/${locale}/contact`,
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'MeDream Studio' }],
    },
  }
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
