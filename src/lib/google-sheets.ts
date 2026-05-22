// src/lib/google-sheets.ts
import { google } from 'googleapis'

export async function appendContactRow(row: {
  timestamp: string
  name: string
  email: string
  phone: string
  service: string
  budget: string
  message: string
  locale: string
}) {
  const keyJson = Buffer.from(
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY!,
    'base64'
  ).toString('utf-8')

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(keyJson),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const sheets = google.sheets({ version: 'v4', auth })

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID!,
    range: 'Sheet1!A:H',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        row.timestamp,
        row.name,
        row.email,
        row.phone,
        row.service,
        row.budget,
        row.message,
        row.locale,
      ]],
    },
  })
}
