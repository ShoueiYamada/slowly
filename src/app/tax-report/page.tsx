'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { useLang } from '@/contexts/LangContext'
import Sidebar from '@/components/Sidebar'

type Entry = { started_at: string; duration_seconds: number; hourly_rate: number; client_id: string | null }
type Client = { id: string; name: string; currency: string; hourly_rate: number }

export default function TaxReportPage() {
  const [user, setUser] = useState<any>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [entries, setEntries] = useState<Entry[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [rates, setRates] = useState<Record<string, number>>({ USD: 150, EUR: 163, GBP: 190, JPY: 1 })
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)
  const { tokens } = useTheme()
  const { lang } = useLang()
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
      else { setUser(user); loadData(user.id) }
    })
    fetch('/api/exchange-rate').then(r => r.json()).then(data => {
      if (data.rates) setRates(data.rates)
    })
  }, [])

  async function loadData(uid: string) {
    const [{ data: e }, { data: c }] = await Promise.all([
      supabase.from('time_entries').select('*').eq('user_id', uid),
      supabase.from('clients').select('*').eq('user_id', uid),
    ])
    if (e) setEntries(e)
    if (c) setClients(c)
    setLoading(false)
  }

  function getRate(entry: Entry) {
    return entry.hourly_rate || clients.find(c => c.id === entry.client_id)?.hourly_rate || 0
  }

  function getCurrency(entry: Entry) {
    return clients.find(c => c.id === entry.client_id)?.currency || 'USD'
  }

  function toJPY(amount: number, currency: string) {
    if (currency === 'JPY') return amount
    const rate = rates[currency]
    if (!rate) return amount * 150
    // ratesはUSDベースなので変換
    const usdAmount = currency === 'USD' ? amount : amount / (rates[currency] || 1)
    return usdAmount * rates['JPY']
  }

  // 年でフィルタ
  const yearEntries = entries.filter(e => new Date(e.started_at).getFullYear() === selectedYear)

  // クライアント別集計
  const clientSummary = clients.map(c => {
    const clientEntries = yearEntries.filter(e => e.client_id === c.id)
    const hours = clientEntries.reduce((s, e) => s + e.duration_seconds / 3600, 0)
    const revenue = clientEntries.reduce((s, e) => s + (e.duration_seconds / 3600) * getRate(e), 0)
    const revenueJPY = toJPY(revenue, c.currency)
    return { ...c, hours: Math.round(hours * 10) / 10, revenue: Math.round(revenue), revenueJPY: Math.round(revenueJPY) }
  }).filter(c => c.revenue > 0).sort((a, b) => b.revenueJPY - a.revenueJPY)

  // 月別集計
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthEntries = yearEntries.filter(e => new Date(e.started_at).getMonth() === i)
    const revenueJPY = monthEntries.reduce((s, e) => {
      const rev = (e.duration_seconds / 3600) * getRate(e)
      return s + toJPY(rev, getCurrency(e))
    }, 0)
    return { month: i + 1, revenueJPY: Math.round(revenueJPY) }
  })

  const totalJPY = clientSummary.reduce((s, c) => s + c.revenueJPY, 0)
  const totalHours = clientSummary.reduce((s, c) => s + c.hours, 0)
  const maxMonthly = Math.max(...monthlyData.map(m => m.revenueJPY), 1)

  const symbol = (currency: string) => currency === 'JPY' ? '¥' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'
  const sidebarW = isMobile ? 0 : (collapsed ? 56 : 232)

  function printReport() {
    window.print()
  }

  const printStyle = `
    @media print {
      body * { visibility: hidden; }
      #tax-report, #tax-report * { visibility: visible; }
      #tax-report { position: absolute; left: 0; top: 0; width: 100%; }
      .no-print { display: none !important; }
    }
  `

  if (!user) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: tokens.bg, overflowX: 'hidden' }}>
      <style>{printStyle}</style>
      <Sidebar userEmail={user.email || ''} onSignOut={async () => { await supabase.auth.signOut(); router.push('/login') }} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ marginLeft: sidebarW + 'px', flex: 1, minWidth: 0, overflowX: 'hidden', padding: isMobile ? '4.5rem 1rem 1rem' : '2rem 2.5rem', transition: 'margin-left 0.2s' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }} id="tax-report">

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid ' + tokens.border }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', color: tokens.text, margin: '0 0 4px', letterSpacing: '-0.4px' }}>
                {lang === 'ja' ? '確定申告用 収入レポート' : 'Annual Income Report'}
              </h1>
              <p style={{ fontSize: '13px', color: tokens.textTertiary, margin: 0 }}>
                {lang === 'ja' ? `${selectedYear}年 海外収入まとめ` : `${selectedYear} Overseas Income Summary`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} className="no-print">
              <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
                style={{ padding: '7px 12px', border: '1px solid ' + tokens.border, borderRadius: '8px', fontSize: '13px', color: tokens.text, background: tokens.bgHover, fontFamily: 'inherit', outline: 'none' }}>
                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}{lang === 'ja' ? '年' : ''}</option>)}
              </select>
              <button onClick={printReport}
                style={{ padding: '7px 16px', background: tokens.accent, color: '#080808', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                {lang === 'ja' ? '印刷 / PDFで保存' : 'Print / Save as PDF'}
              </button>
            </div>
          </div>

          {/* サマリーカード */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '1.5rem' }}>
            {[
              { label: lang === 'ja' ? '年間総収入（円換算）' : 'Total Revenue (JPY)', value: '¥' + totalJPY.toLocaleString(), accent: true },
              { label: lang === 'ja' ? '総作業時間' : 'Total Hours', value: Math.round(totalHours * 10) / 10 + 'h', accent: false },
              { label: lang === 'ja' ? 'クライアント数' : 'Clients', value: clientSummary.length + (lang === 'ja' ? '社' : ''), accent: false },
            ].map((m, i) => (
              <div key={i} style={{ background: tokens.bgCard, borderRadius: '12px', padding: '1.25rem', border: '1px solid ' + tokens.border }}>
                <div style={{ fontSize: '11px', color: tokens.textTertiary, marginBottom: '6px', letterSpacing: '0.04em' }}>{m.label}</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: m.accent ? tokens.accent : tokens.text, letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* 月別グラフ */}
          <div style={{ background: tokens.bgCard, borderRadius: '12px', border: '1px solid ' + tokens.border, padding: '1.25rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '600', color: tokens.text, marginBottom: '1.25rem', letterSpacing: '-0.2px' }}>
              {lang === 'ja' ? '月別収入（円換算）' : 'Monthly Revenue (JPY)'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '120px' }}>
              {monthlyData.map((m, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '9px', color: tokens.textTertiary, fontVariantNumeric: 'tabular-nums' }}>
                    {m.revenueJPY > 0 ? '¥' + (m.revenueJPY / 10000).toFixed(0) + 'w' : ''}
                  </div>
                  <div style={{ width: '100%', background: m.revenueJPY > 0 ? tokens.accent : tokens.bgHover, borderRadius: '4px 4px 0 0', height: Math.max(4, (m.revenueJPY / maxMonthly) * 90) + 'px', transition: 'height 0.3s' }} />
                  <div style={{ fontSize: '9px', color: tokens.textTertiary }}>
                    {lang === 'ja' ? m.month + '月' : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* クライアント別内訳 */}
          <div style={{ background: tokens.bgCard, borderRadius: '12px', border: '1px solid ' + tokens.border, overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid ' + tokens.border }}>
              <h2 style={{ fontSize: '14px', fontWeight: '600', color: tokens.text, margin: 0, letterSpacing: '-0.2px' }}>
                {lang === 'ja' ? 'クライアント別収入内訳' : 'Revenue by Client'}
              </h2>
            </div>
            {clientSummary.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <p style={{ color: tokens.textTertiary, fontSize: '13px' }}>
                  {lang === 'ja' ? `${selectedYear}年のデータがありません` : `No data for ${selectedYear}`}
                </p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: tokens.bgHover }}>
                    {[
                      lang === 'ja' ? 'クライアント' : 'Client',
                      lang === 'ja' ? '通貨' : 'Currency',
                      lang === 'ja' ? '作業時間' : 'Hours',
                      lang === 'ja' ? '外貨収入' : 'Revenue',
                      lang === 'ja' ? '円換算' : 'JPY',
                      lang === 'ja' ? '割合' : 'Share',
                    ].map((h, i) => (
                      <th key={i} style={{ padding: '10px 16px', fontSize: '11px', fontWeight: '600', color: tokens.textTertiary, textAlign: i === 0 ? 'left' : 'right', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clientSummary.map((c, i) => (
                    <tr key={c.id} style={{ borderTop: '1px solid ' + tokens.border }}>
                      <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500', color: tokens.text }}>{c.name}</td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: tokens.textSecondary, textAlign: 'right' }}>
                        <span style={{ background: tokens.accentBg, color: tokens.accentText, padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>{c.currency}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: tokens.textSecondary, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{c.hours}h</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: tokens.textSecondary, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{symbol(c.currency)}{c.revenue.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '700', color: tokens.accent, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>¥{c.revenueJPY.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                          <div style={{ width: '60px', height: '4px', background: tokens.bgHover, borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: (c.revenueJPY / totalJPY * 100) + '%', background: tokens.accent, borderRadius: '2px' }} />
                          </div>
                          <span style={{ fontSize: '12px', color: tokens.textTertiary, minWidth: '32px', textAlign: 'right' }}>{Math.round(c.revenueJPY / totalJPY * 100)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '2px solid ' + tokens.borderStrong, background: tokens.bgHover }}>
                    <td colSpan={4} style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: tokens.text }}>{lang === 'ja' ? '合計' : 'Total'}</td>
                    <td style={{ padding: '12px 16px', fontSize: '16px', fontWeight: '800', color: tokens.accent, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>¥{totalJPY.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: tokens.textTertiary, textAlign: 'right' }}>100%</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>

          {/* 確定申告メモ欄 */}
          <div style={{ background: tokens.bgCard, borderRadius: '12px', border: '1px solid ' + tokens.border, padding: '1.25rem' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '600', color: tokens.text, marginBottom: '0.75rem', letterSpacing: '-0.2px' }}>
              {lang === 'ja' ? '税理士・確定申告メモ' : 'Tax Filing Notes'}
            </h2>
            <div style={{ fontSize: '13px', color: tokens.textSecondary, lineHeight: '1.8', background: tokens.bgHover, borderRadius: '8px', padding: '1rem' }}>
              {lang === 'ja' ? (
                <>
                  <p>• 本レポートは{selectedYear}年1月1日〜12月31日の作業記録をもとに作成されています</p>
                  <p>• 円換算レートは取得時点のレートを使用しています（実際の申告には確定申告時のレートをご確認ください）</p>
                  <p>• 海外収入は雑所得として申告が必要な場合があります。税理士にご確認ください</p>
                  <p>• 為替差益が生じる場合は別途申告が必要になる場合があります</p>
                </>
              ) : (
                <>
                  <p>• This report covers work records from Jan 1 to Dec 31, {selectedYear}</p>
                  <p>• Exchange rates used are approximate. Please verify with official rates for tax filing</p>
                  <p>• Overseas income may need to be declared as miscellaneous income. Consult your accountant</p>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
