'use client'
import { useEffect, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useLang } from '@/contexts/LangContext'

type Rates = { JPY: number; EUR: number; GBP: number; USD: number }

export default function ExchangeRates() {
  const [rates, setRates] = useState<Rates | null>(null)
  const [updated, setUpdated] = useState<string | null>(null)
  const [fallback, setFallback] = useState(false)
  const [loading, setLoading] = useState(true)
  const { tokens } = useTheme()
  const { lang } = useLang()

  useEffect(() => {
    fetch('/api/exchange-rate')
      .then(r => r.json())
      .then(data => {
        setRates(data.rates)
        setUpdated(data.updated)
        setFallback(data.fallback || false)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return null

  const pairs = [
    { from: 'USD', to: 'JPY', rate: rates?.JPY, symbol: '¥' },
    { from: 'EUR', to: 'JPY', rate: rates ? rates.JPY / rates.EUR : null, symbol: '¥' },
    { from: 'GBP', to: 'JPY', rate: rates ? rates.JPY / rates.GBP : null, symbol: '¥' },
  ]

  return (
    <div style={{ background: tokens.bgCard, borderRadius: '12px', border: '1px solid ' + tokens.border, padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '12px', fontWeight: '600', color: tokens.textTertiary, letterSpacing: '0.06em' }}>
          {lang === 'ja' ? '為替レート' : 'EXCHANGE RATES'}
        </span>
        <span style={{ fontSize: '11px', color: tokens.textTertiary }}>
          {fallback
            ? (lang === 'ja' ? '参考レート' : 'Reference rate')
            : updated
              ? (lang === 'ja' ? '最新' : 'Live')
              : ''}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        {pairs.map((p, i) => (
          <div key={i}>
            <div style={{ fontSize: '11px', color: tokens.textTertiary, marginBottom: '2px' }}>
              1 {p.from}
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: tokens.accent, letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>
              {p.symbol}{p.rate ? Math.round(p.rate).toLocaleString() : '—'}
            </div>
            <div style={{ fontSize: '10px', color: tokens.textTertiary }}>{p.to}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
