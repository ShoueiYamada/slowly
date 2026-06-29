import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 無料の為替APIを使用
    const res = await fetch('https://open.er-api.com/v6/latest/USD')
    const data = await res.json()

    if (!data.rates) {
      throw new Error('Failed to fetch rates')
    }

    return NextResponse.json({
      base: 'USD',
      rates: {
        JPY: data.rates.JPY,
        EUR: data.rates.EUR,
        GBP: data.rates.GBP,
        USD: 1,
      },
      updated: data.time_last_update_utc
    })
  } catch (e) {
    // フォールバック（固定レート）
    return NextResponse.json({
      base: 'USD',
      rates: { JPY: 150, EUR: 0.92, GBP: 0.79, USD: 1 },
      updated: null,
      fallback: true
    })
  }
}
