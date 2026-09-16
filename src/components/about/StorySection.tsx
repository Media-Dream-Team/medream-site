import type { AboutStorySection } from '@/types/content'

interface Props {
  story: AboutStorySection[]
  locale: string
}

export function StorySection({ story, locale }: Props) {
  const l = locale as 'th' | 'en'
  return (
    <section className="bg-surface-tint border-t border-line py-16 md:py-24 lg:py-32 px-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-14">
        {story.map((section, i) => (
          <div key={i} className="grid grid-cols-[40px_1fr] gap-6">
            <span className="font-display font-bold text-sm text-white bg-navy w-10 h-10 flex items-center justify-center flex-shrink-0">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <h2 className="font-display font-semibold text-ink text-2xl md:text-[28px] mb-4">
                {l === 'th' ? section.heading_th : section.heading_en}
              </h2>
              <div className="flex flex-col gap-3.5">
                {(l === 'th' ? section.body_th : section.body_en).split('\n\n').map((p, pi) => (
                  <p key={pi} className="text-fg-2 text-base leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
