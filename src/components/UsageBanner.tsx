'use client'
import { useEffect, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useLang } from '@/contexts/LangContext'
import { getUsage, LIMITS } from '@/lib/plan'

export default function UsageBanner({ userId }: { userId: string }) {
  const [usage, setUsage] = useState<any>(null)
  const { tokens } = useTheme()
  const { lang } = useLang()

  useEffect(() => {
    getUsage(userId).then(setUsage)
  }, [userId])

  if (!usage || usage.plan === 'pro') return null

  const items = [
    { label: lang === 'ja' ? 'クライアント' : 'Clients', used: usage.clientCount, limit: LIMITS.free.clients },
    { label: lang === 'ja' ? '請求書（今月）' : 'Invoices (month)', used: usage.invoiceCount, limit: LIMITS.free.invoicesPerMonth },
    { label: lang === 'ja' ? 'AI督促（今月）' : 'AI Reminders (month)', used: usage.reminderCount, limit: LIMITS.free.remindersPerMonth },
  ]

  const hasWarning = items.some(i => i.used >= i.limit * 0.8)

  return (
    <div style={{ background: hasWarning ? 'rgba(56,189,248,0.08)' : tokens.bgHover, border: '1px solid ' + (hasWarning ? 'rgba(56,189,248,0.25)' : tokens.border), borderRadius: '14px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
      <div style={{ fontSize: '12px', fontWeight: '700', color: hasWarning ? '#38BDF8' : tokens.textTertiary, letterSpacing: '0.05em', flexShrink: 0 }}>
        FREE PLAN
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', flex: 1, flexWrap: 'wrap' }}>
        {items.map((item, i) => {
          const pct = Math.min((item.used / item.limit) * 100, 100)
          const isWarning = item.used >= item.limit * 0.8
          const isFull = item.used >= item.limit
          return (
            <div key={i} style={{ minWidth: '120px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: tokens.textTertiary }}>{item.label}</span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: isFull ? tokens.danger : isWarning ? '#38BDF8' : tokens.textSecondary }}>{item.used}/{item.limit}</span>
              </div>
              <div style={{ height: '4px', background: tokens.bgCard, borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: pct + '%', background: isFull ? tokens.danger : isWarning ? '#38BDF8' : tokens.textTertiary, borderRadius: '2px', transition: 'width 0.3s' }} />
              </div>
            </div>
          )
        })}
      </div>
      <button onClick={() => window.location.href = '/pricing'}
        style={{ padding: '7px 16px', background: '#38BDF8', color: '#08080F', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', fontFamily: 'inherit', flexShrink: 0 }}>
        {lang === 'ja' ? 'Proにアップグレード' : 'Upgrade to Pro'}
      </button>
    </div>
  )
}
