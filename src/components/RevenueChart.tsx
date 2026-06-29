'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Lang } from '@/lib/i18n'
import { useTheme } from '@/contexts/ThemeContext'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

type Entry = { started_at: string; duration_seconds: number; hourly_rate: number | null; client_id: string | null }
type Client = { id: string; name: string; hourly_rate: number; currency: string }

export default function RevenueChart({ userId, refresh, lang }: { userId: string, refresh: number, lang: Lang }) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [view, setView] = useState<'weekly' | 'monthly'>('weekly')
  const { tokens } = useTheme()
  const supabase = createClient()

  useEffect(() => { load() }, [refresh])

  async function load() {
    const [{ data: e }, { data: c }] = await Promise.all([
      supabase.from('time_entries').select('started_at, duration_seconds, hourly_rate, client_id').eq('user_id', userId).order('started_at', { ascending: true }),
      supabase.from('clients').select('*').eq('user_id', userId)
    ])
    if (e) setEntries(e)
    if (c) setClients(c)
  }

  function getRate(entry: Entry) {
    if (entry.hourly_rate && entry.hourly_rate > 0) return entry.hourly_rate
    return clients.find(c => c.id === entry.client_id)?.hourly_rate || 0
  }

  function calcRevenue(e: Entry) { return (e.duration_seconds / 3600) * getRate(e) }

  function getWeeklyData() {
    const weeks: Record<string, number> = {}
    const now = new Date()
    for (let i = 6; i >= 0; i--) { const d = new Date(now); d.setDate(d.getDate() - i); weeks[`${d.getMonth() + 1}/${d.getDate()}`] = 0 }
    entries.forEach(e => { const d = new Date(e.started_at); const k = `${d.getMonth() + 1}/${d.getDate()}`; if (k in weeks) weeks[k] += calcRevenue(e) })
    return weeks
  }

  function getMonthlyData() {
    const months: Record<string, number> = {}
    const now = new Date()
    for (let i = 5; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); months[`${d.getFullYear()}/${d.getMonth() + 1}`] = 0 }
    entries.forEach(e => { const d = new Date(e.started_at); const k = `${d.getFullYear()}/${d.getMonth() + 1}`; if (k in months) months[k] += calcRevenue(e) })
    return months
  }

  const data = view === 'weekly' ? getWeeklyData() : getMonthlyData()
  const values = Object.values(data).map(v => Math.round(v))
  const totalRevenue = values.reduce((s, v) => s + v, 0)
  const totalHours = Math.round(entries.reduce((s, e) => s + e.duration_seconds, 0) / 3600)
  const avgPerEntry = entries.length > 0 ? Math.round(totalRevenue / entries.length) : 0

  const chartData = {
    labels: Object.keys(data),
    datasets: [{ data: values, backgroundColor: tokens.accent + '99', borderRadius: 4, borderSkipped: false, hoverBackgroundColor: tokens.accent }]
  }

  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: any) => ` $${ctx.raw.toLocaleString()}` }, backgroundColor: tokens.bgCard, titleColor: tokens.text, bodyColor: tokens.textSecondary, borderColor: tokens.border, borderWidth: 1, padding: 10 }
    },
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11 }, color: tokens.textTertiary } },
      y: { grid: { color: tokens.border }, border: { display: false }, ticks: { font: { size: 11 }, color: tokens.textTertiary, callback: (v: any) => `$${v}` } }
    }
  }

  const metrics = [
    { label: lang === 'ja' ? '収益' : 'Revenue', value: `$${totalRevenue.toLocaleString()}`, highlight: true },
    { label: lang === 'ja' ? '時間' : 'Hours', value: `${totalHours}h`, highlight: false },
    { label: lang === 'ja' ? '平均' : 'Avg/entry', value: `$${avgPerEntry}`, highlight: false },
  ]

  return (
    <div style={{ background: tokens.bgCard, borderRadius: '12px', border: '1px solid ' + tokens.border, padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {metrics.map((m, i) => (
            <div key={i}>
              <div style={{ fontSize: '11px', color: tokens.textTertiary, marginBottom: '3px', letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>{m.label}</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: m.highlight ? tokens.accent : tokens.text, letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>{m.value}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', background: tokens.bgHover, borderRadius: '8px', padding: '3px', gap: '2px' }}>
          {(['weekly', 'monthly'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: view === v ? '600' : '400', fontFamily: 'inherit', background: view === v ? tokens.bgCard : 'transparent', color: view === v ? tokens.text : tokens.textTertiary, transition: 'all 0.15s', letterSpacing: '-0.1px' }}>
              {v === 'weekly' ? (lang === 'ja' ? '週次' : 'Weekly') : (lang === 'ja' ? '月次' : 'Monthly')}
            </button>
          ))}
        </div>
      </div>
      <div style={{ height: '160px' }}>
        {entries.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: tokens.textTertiary, fontSize: '13px' }}>{lang === 'ja' ? 'データなし'  : 'No data yet'}</p>
          </div>
        ) : <Bar data={chartData} options={options as any} />}
      </div>
    </div>
  )
}
