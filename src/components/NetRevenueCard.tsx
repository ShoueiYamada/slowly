'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useTheme } from '@/contexts/ThemeContext'
import { useLang } from '@/contexts/LangContext'

type Client = { id: string; name: string; currency: string; transfer_method: string; transfer_fee_percent: number; transfer_fee_fixed: number }
type Entry = { duration_seconds: number; hourly_rate: number; client_id: string | null }

export default function NetRevenueCard({ userId, refresh }: { userId: string; refresh: number }) {
  const [clients, setClients] = useState<Client[]>([])
  const [entries, setEntries] = useState<Entry[]>([])
  const [rates, setRates] = useState<Record<string, number>>({ USD: 150, EUR: 163, GBP: 190 })
  const { tokens } = useTheme()
  const { lang } = useLang()
  const supabase = createClient()

  useEffect(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    Promise.all([
      supabase.from('clients').select('*').eq('user_id', userId),
      supabase.from('time_entries').select('duration_seconds, hourly_rate, client_id').eq('user_id', userId).gte('started_at', monthStart),
      fetch('/api/exchange-rate').then(r => r.json()),
    ]).then(([{ data: c }, { data: e }, rateData]) => {
      if (c) setClients(c)
      if (e) setEntries(e)
      if (rateData.rates) setRates(rateData.rates)
    })
  }, [refresh])

  function calcRevenue(entry: Entry) {
    return (entry.duration_seconds / 3600) * (entry.hourly_rate || 0)
  }

  function calcFee(revenue: number, client: Client | undefined) {
    if (!client) return 0
    const feePercent = (client.transfer_fee_percent || 0) / 100
    const feeFixed = client.transfer_fee_fixed || 0
    return revenue * feePercent + feeFixed
  }

  function toJPY(amount: number, currency: string) {
    if (currency === 'JPY') return amount
    return (amount / (rates[currency] || 1)) * rates['JPY']
  }

  const grossRevenue = entries.reduce((s, e) => s + calcRevenue(e), 0)
  const totalFees = entries.reduce((s, e) => {
    const client = clients.find(c => c.id === e.client_id)
    return s + calcFee(calcRevenue(e), client)
  }, 0)
  const netRevenue = grossRevenue - totalFees

  const grossJPY = Math.round(toJPY(grossRevenue, 'USD'))
  const feesJPY = Math.round(toJPY(totalFees, 'USD'))
  const netJPY = Math.round(toJPY(netRevenue, 'USD'))

  if (grossRevenue === 0) return null

  return (
    <div style={{ background: tokens.bgCard, borderRadius: '12px', border: '1px solid ' + tokens.border, padding: '1.25rem', marginBottom: '1.25rem' }}>
      <div style={{ fontSize: '11px', fontWeight: '600', color: tokens.textTertiary, letterSpacing: '0.06em', marginBottom: '1rem' }}>
        {lang === 'ja' ? '今月の実収入（手数料控除後）' : 'NET REVENUE THIS MONTH (after fees)'}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '11px', color: tokens.textTertiary, marginBottom: '4px' }}>
            {lang === 'ja' ? '総収入' : 'Gross'}
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: tokens.text, letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>
            ¥{grossJPY.toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: tokens.textTertiary, marginBottom: '4px' }}>
            {lang === 'ja' ? '送金手数料' : 'Transfer Fees'}
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: tokens.danger, letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>
            -¥{feesJPY.toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: tokens.textTertiary, marginBottom: '4px' }}>
            {lang === 'ja' ? '手取り額' : 'Net'}
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: tokens.success, letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>
            ¥{netJPY.toLocaleString()}
          </div>
        </div>
      </div>
      {totalFees > 0 && (
        <div style={{ marginTop: '10px', padding: '8px 12px', background: tokens.bgHover, borderRadius: '8px', fontSize: '12px', color: tokens.textTertiary }}>
          {lang === 'ja'
            ? `送金手数料 ¥${feesJPY.toLocaleString()} を差し引いた手取り額です`
            : `After ¥${feesJPY.toLocaleString()} in transfer fees`}
        </div>
      )}
    </div>
  )
}
