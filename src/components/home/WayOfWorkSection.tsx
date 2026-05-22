import type { PipelineStep } from '@/types/content'

interface Props {
  steps: PipelineStep[]
  locale: string
}

export function WayOfWorkSection({ steps, locale }: Props) {
  const l = locale as 'th' | 'en'
  return (
    <section className="py-20 px-4 bg-deep-space/30">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-dawn-gold mb-10 text-center">
          {l === 'th' ? 'วิธีการทำงาน' : 'How We Work'}
        </h2>

        {/* Desktop: horizontal */}
        <div className="hidden md:flex items-center justify-between gap-2">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className="flex-1 text-center">
                <div className="w-14 h-14 rounded-full bg-royal-blue border-2 border-electric flex items-center justify-center text-2xl mx-auto mb-2">
                  {step.icon}
                </div>
                <p className="text-dream-cream text-sm font-bold">
                  {l === 'th' ? step.label_th : step.label_en}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div className="w-8 h-0.5 bg-electric flex-shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Mobile: vertical */}
        <div className="flex flex-col gap-4 md:hidden">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-royal-blue border-2 border-electric flex items-center justify-center text-xl flex-shrink-0">
                {step.icon}
              </div>
              <div>
                <p className="text-dream-cream font-bold">
                  {l === 'th' ? step.label_th : step.label_en}
                </p>
                {i < steps.length - 1 && (
                  <div className="w-0.5 h-4 bg-electric ml-6 mt-2" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
