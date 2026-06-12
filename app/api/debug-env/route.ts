import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.DODO_PAYMENTS_API_KEY
  const dodoEnv = process.env.DODO_ENV
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  return NextResponse.json({
    DODO_ENV: dodoEnv || 'NOT SET',
    NEXT_PUBLIC_APP_URL: appUrl || 'NOT SET',
    API_KEY_EXISTS: !!apiKey,
    API_KEY_LENGTH: apiKey?.length || 0,
    API_KEY_FIRST_10: apiKey?.substring(0, 10) || 'NOT SET',
    API_KEY_LAST_5: apiKey?.slice(-5) || 'NOT SET',
    API_KEY_HAS_DOTS: apiKey?.includes('.') || false,
    API_KEY_HAS_DASHES: apiKey?.includes('-') || false,
  })
}
