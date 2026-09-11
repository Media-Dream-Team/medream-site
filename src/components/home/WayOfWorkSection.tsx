import type { HomeContent } from '@/types/content'
import { LevelBadge } from '@/components/ui/LevelBadge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface Props {
  home: HomeContent
  locale: string
}

export function WayOfWorkSection({ home, locale }: Props) {
  const l = locale as 'th' | 'en'
  const { wayOfWork } = home

  return (
    <section className="bg-white py-16 md:py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display font-semibold text-ink text-3xl md:text-[36px] md:leading-[44px] mb-12 text-center">
          {l === 'th' ? wayOfWork.headline_th : wayOfWork.headline_en}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {wayOfWork.steps.map(step => (
            <Card key={step.level} className="text-center">
              <LevelBadge
                level={step.level}
                total={wayOfWork.steps.length}
                label={l === 'th' ? step.label_th : step.label_en}
                className="justify-center mb-3"
              />
            </Card>
          ))}
        </div>
        <div className="text-center">
          <Button href={`/${locale}/contact`} variant="text" surface="light">
            {l === 'th' ? wayOfWork.cta_th : wayOfWork.cta_en}
          </Button>
        </div>
      </div>
    </section>
  )
}
