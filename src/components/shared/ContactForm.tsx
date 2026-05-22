// src/components/shared/ContactForm.tsx
'use client'
import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import type { Service } from '@/types/content'

interface Props {
  services: Service[]
}

export function ContactForm({ services }: Props) {
  const locale = useLocale()
  const t = useTranslations('contact_form')
  const searchParams = useSearchParams()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    budget: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  useEffect(() => {
    const preService = searchParams.get('service')
    if (preService) setForm(f => ({ ...f, service: preService }))
  }, [searchParams])

  function set(key: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, locale }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  const inputClass =
    'w-full bg-deep-space border border-nebula rounded px-4 py-2 text-dream-cream placeholder-horizon focus:outline-none focus:border-electric transition-colors'
  const labelClass = 'block text-sm font-bold text-horizon mb-1'

  if (status === 'success') {
    return (
      <div className="text-center py-12">
        <p className="text-dawn-gold text-xl font-bold">{t('success')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>
            {t('name')} <span className="text-dawn-gold">*</span>
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
            {t('email')} <span className="text-dawn-gold">*</span>
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

      <div>
        <label className={labelClass}>{t('message')}</label>
        <textarea
          rows={4}
          value={form.message}
          onChange={set('message')}
          placeholder={t('message')}
          className={`${inputClass} resize-none`}
        />
      </div>

      {status === 'error' && (
        <p className="text-red-400 text-sm">{t('error')}</p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="px-8 py-3 bg-royal-blue hover:bg-electric disabled:bg-nebula text-white font-bold rounded transition-colors"
      >
        {status === 'submitting' ? t('submitting') : t('submit')}
      </button>
    </form>
  )
}
