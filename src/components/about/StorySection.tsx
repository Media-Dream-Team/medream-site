import type { AboutStorySection } from '@/types/content'

interface Props {
  story: AboutStorySection[]
  locale: string
}

export function StorySection({ story, locale }: Props) {
  const l = locale as 'th' | 'en'
  return (
    <section className="bg-white py-16 md:py-24 px-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-12">
        {story.map((section, i) => (
          <div key={i}>
            <h2 className="font-display font-semibold text-ink text-2xl md:text-[28px] mb-4">
              {l === 'th' ? section.heading_th : section.heading_en}
            </h2>
            <p className="text-fg-2 text-base leading-relaxed whitespace-pre-line">
              {l === 'th' ? section.body_th : section.body_en}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
