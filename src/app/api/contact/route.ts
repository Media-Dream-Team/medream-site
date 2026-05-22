// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { appendContactRow } from '@/lib/google-sheets'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, service, budget, message, locale } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'name and email are required' }, { status: 400 })
    }

    await appendContactRow({
      timestamp: new Date().toISOString(),
      name,
      email,
      phone: phone ?? '',
      service: service ?? '',
      budget: budget ?? '',
      message: message ?? '',
      locale: locale ?? 'th',
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[contact]', err)
    return NextResponse.json({ error: 'internal error' }, { status: 500 })
  }
}
