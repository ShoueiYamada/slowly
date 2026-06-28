'use client'
import { useEffect, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useLang } from '@/contexts/LangContext'
import { getUsage, LIMITS } from '@/lib/plan'

export default function UsageBanner({ userId }: { userId: string }) {
  const [usage, setUsage] = useState<any>(null)
  const { tokens } = useTheme()
  const { lang } = useLang()

  useEffect(() => { getUsage(userId).then(setUsage) }, [userId])

  if (!usage || usage.plan === 'pro') return null

  const items = [
    { label: lang === 'ja' ? 'クライアント' : 'Clients', used: usage.clientCount, limit: LIMITS.free.clients },
    { label: lang === 'ja' ? '請求書' : 'Invoices', used: usage.invoiceCount, limit: LIMITS.free.invoicesPerMonth },
    { label: lang === 'ja' ? 'AI督促' : 'AI', used: usage.reminderCount, limit: LIMITS.free.remindersPerMonth },
  ]

  const hasWarning = items.some(i => i.used >= i.limit * 0.8)

  return (
    <div style={{ background: tokens.bgCard, border: '1px solid ' + (hasWarning ? tokens.borderStrong : tokens.border), borderRadius: '10px', padding: '10px 16px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '10px', fontWeight: '700', color: tokens.textTertiary, letterSpacing: '0.08em' }}>FREE</span>
      <div style={{ display: 'flex', gap: '1.25rem', flex: 1, flexWrap: 'wrap' }}>
        {items.map((item, i) => {
          const pct = Math.min((item.used / item.limit) * 100, 100)
          const isFull = item.used >= item.limit
          const isWarn = item.used >= item.limit * 0.8
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: tokens.textTertiary }}>{item.label}</span>
              <div style={{ width: '60px', height: '3px', background: tokens.bgHover, borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: pct + '%', background: isFull ? tokens.danger : isWarn ? tokens.accent : tokens.textTertiary, borderRadius: '2px', transition: 'width 0.3s' }} />
              </div>
              <span style={{ fontSize: '11px', color: isFull ? tokens.danger : tokens.textTertiary, fontVariantNumeric: 'tabular-nums' }}>{item.used}/{item.limit}</span>
            </div>
          )
        })}
      </div>
      <button onClick={() => window.location.href = '/pricing'}
        style={{ padding: '5px 12px', background: tokens.accent, color: '#080808', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '700', fontFamily: 'inherit', letterSpacing: '0.02em', flexShrink: 0 }}>
        {lang === 'ja' ? 'アップグレード' : 'Upgrade'}
      </button>
    </div>
  )
}
