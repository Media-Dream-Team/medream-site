# MeDream Studio Website

Next.js 16 · Tailwind CSS v4 · next-intl (TH/EN) · Vercel

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Content Updates

Edit JSON files in `/content/`, commit, push → Vercel auto-redeploys.

## Environment Variables

Copy `.env.example` to `.env.local`:

```
GOOGLE_SERVICE_ACCOUNT_KEY=  # base64-encoded service account JSON
GOOGLE_SHEET_ID=              # spreadsheet ID from sheet URL
SITE_URL=https://www.medream-studio.com
```

### Google Sheets Setup

1. Create a Google Sheet with columns: Timestamp | Name | Email | Phone | Service | Budget | Message | Locale
2. Create a service account in Google Cloud Console
3. Enable Google Sheets API
4. Share the sheet with the service account email
5. Base64-encode the downloaded JSON key: `base64 -i key.json | tr -d '\n'`
6. Set `GOOGLE_SERVICE_ACCOUNT_KEY` to that string in Vercel dashboard
7. Set `GOOGLE_SHEET_ID` to the spreadsheet ID (from the sheet URL)

## Deploy

Push to `main` → Vercel deploys automatically.
