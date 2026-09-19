// src/components/shared/ContactForm.tsx
'use client'
import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import type { ServiceGroup } from '@/types/content'
import { Star } from '@/components/ui/Star'

const CHAMFER_STYLE: React.CSSProperties = {
  clipPath: 'polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)',
}

type Topic = '' | 'hire' | 'careers' | 'partnership' | 'general'

interface Props {
  services: ServiceGroup[]
}

export function ContactForm({ services }: Props) {
  const locale = useLocale()
  const t = useTranslations('contact_form')
  const searchParams = useSearchParams()

  const [form, setForm] = useState({
    topic: '' as Topic,
    name: '',
    email: '',
    phone: '',
    service: '',
    budget: '',
    position: '',
    portfolioUrl: '',
    company: '',
    partnershipType: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  useEffect(() => {
    const preService = searchParams.get('service')
    if (preService) setForm(f => ({ ...f, topic: 'hire', service: preService }))
  }, [searchParams])

  function set(key: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')

    const extraLines: string[] = []
    if (form.topic === 'careers') {
      if (form.position) extraLines.push(`${t('position')}: ${form.position}`)
      if (form.portfolioUrl) extraLines.push(`${t('portfolio_url')}: ${form.portfolioUrl}`)
    }
    if (form.topic === 'partnership') {
      if (form.company) extraLines.push(`${t('company')}: ${form.company}`)
      if (form.partnershipType) extraLines.push(`${t('partnership_type')}: ${t(`partnership_types.${form.partnershipType}`)}`)
    }
    const message = extraLines.length > 0 ? `${extraLines.join('\n')}\n\n${form.message}` : form.message

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: form.topic,
          name: form.name,
          email: form.email,
          phone: form.phone,
          service: form.topic === 'hire' ? form.service : '',
          budget: form.topic === 'hire' ? form.budget : '',
          message,
          locale,
        }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  const inputClass =
    'w-full bg-white border border-line px-4 py-2.5 text-ink placeholder-fg-3 focus:outline-none focus:border-blue transition-colors'
  const labelClass = 'block text-sm font-display font-semibold text-fg-2 mb-1'

  if (status === 'success') {
    return (
      <div className="text-center py-12">
        <p className="font-display font-semibold text-navy text-xl">{t('success')}</p>
      </div>
    )
  }

  const messageLabel = form.topic === 'careers' ? t('intro_message') : form.topic === 'partnership' ? t('details') : t('message')
  const messageRequired = form.topic !== 'hire' && form.topic !== ''

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-2xl mx-auto">
      <div>
        <label className={labelClass}>
          {t('topic')} <span className="text-blue">*</span>
        </label>
        <select required value={form.topic} onChange={set('topic')} className={inputClass}>
          <option value="">{t('topic_placeholder')}</option>
          <option value="hire">{t('topics.hire')}</option>
          <option value="careers">{t('topics.careers')}</option>
          <option value="partnership">{t('topics.partnership')}</option>
          <option value="general">{t('topics.general')}</option>
        </select>
      </div>

      {form.topic && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>
                {t('name')} <span className="text-blue">*</span>
              </label>
              <input
                required
                type="text"
                value={form.name}
                onChange={set('name')}
                placeholder={t('name')}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                {t('email')} <span className="text-blue">*</span>
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder={t('email')}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>{t('phone')}</label>
            <input
              type="tel"
              value={form.phone}
              onChange={set('phone')}
              placeholder={t('phone')}
              className={inputClass}
            />
          </div>

          {form.topic === 'hire' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>{t('service')}</label>
                <select value={form.service} onChange={set('service')} className={inputClass}>
                  <option value="">{t('service_placeholder')}</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      {locale === 'th' ? s.title_th : s.title_en}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('budget')}</label>
                <select value={form.budget} onChange={set('budget')} className={inputClass}>
                  <option value="">{t('budget_placeholder')}</option>
                  <option value="under_50k">{t('budget_options.under_50k')}</option>
                  <option value="50k_200k">{t('budget_options.50k_200k')}</option>
                  <option value="200k_500k">{t('budget_options.200k_500k')}</option>
                  <option value="over_500k">{t('budget_options.over_500k')}</option>
                </select>
              </div>
            </div>
          )}

          {form.topic === 'careers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>{t('position')}</label>
                <input
                  type="text"
                  value={form.position}
                  onChange={set('position')}
                  placeholder={t('position_placeholder')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('portfolio_url')}</label>
                <input
                  type="url"
                  value={form.portfolioUrl}
                  onChange={set('portfolioUrl')}
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {form.topic === 'partnership' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>
                  {t('company')} <span className="text-blue">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={form.company}
                  onChange={set('company')}
                  placeholder={t('company')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('partnership_type')}</label>
                <select value={form.partnershipType} onChange={set('partnershipType')} className={inputClass}>
                  <option value="">{t('partnership_type_placeholder')}</option>
                  <option value="reseller">{t('partnership_types.reseller')}</option>
                  <option value="technology">{t('partnership_types.technology')}</option>
                  <option value="co_marketing">{t('partnership_types.co_marketing')}</option>
                  <option value="other">{t('partnership_types.other')}</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className={labelClass}>
              {messageLabel} {messageRequired && <span className="text-blue">*</span>}
            </label>
            <textarea
              required={messageRequired}
              rows={4}
              value={form.message}
              onChange={set('message')}
              placeholder={messageLabel}
              className={`${inputClass} resize-none`}
            />
          </div>

          {status === 'error' && (
            <p className="text-red-600 text-sm">{t('error')}</p>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            style={CHAMFER_STYLE}
            className="inline-flex items-center justify-center gap-2 self-start px-[22px] py-[13px] bg-blue hover:bg-navy disabled:bg-line disabled:text-fg-3 text-white font-display font-semibold text-[15px] transition-colors"
          >
            <Star className="w-[0.9em] h-[0.9em]" />
            {status === 'submitting' ? t('submitting') : t('submit')}
          </button>
        </>
      )}
    </form>
  )
}
