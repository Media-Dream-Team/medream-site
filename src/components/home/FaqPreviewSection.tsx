import type { HomeContent } from '@/types/content'
import { Button } from '@/components/ui/Button'
import { HomeFaqAccordionItem } from './HomeFaqAccordionItem'

interface Props {
  home: HomeContent
  locale: string
}

export function FaqPreviewSection({ home, locale }: Props) {
  const l = locale as 'th' | 'en'
  const { faqPreview } = home

  return (
    <section className="bg-white py-16 md:py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display font-semibold text-ink text-3xl md:text-[36px] md:leading-[44px] mb-10 text-center">
          {l === 'th' ? faqPreview.headline_th : faqPreview.headline_en}
        </h2>
        <div>
          {faqPreview.items.map((item, i) => (
            <HomeFaqAccordionItem key={i} item={item} locale={locale} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Button href={`/${locale}/faq`} variant="secondary" surface="light">
            {l === 'th' ? faqPreview.cta_th : faqPreview.cta_en}
          </Button>
        </div>
      </div>
    </section>
  )
}
