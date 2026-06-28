'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Lang } from '@/lib/i18n'
import { useTheme } from '@/contexts/ThemeContext'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

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
    datasets: [{ data: values, backgroundColor: tokens.accent, borderRadius: 6, borderSkipped: false }]
  }

  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` $${ctx.raw.toLocaleString()}` }, backgroundColor: tokens.bgCard, titleColor: tokens.text, bodyColor: tokens.textSecondary, borderColor: tokens.border, borderWidth: 1 } },
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11 }, color: tokens.textTertiary } },
      y: { grid: { color: tokens.border }, border: { display: false }, ticks: { font: { size: 11 }, color: tokens.textTertiary, callback: (v: any) => `$${v}` } }
    }
  }

  const metrics = [
    { label: lang === 'ja' ? '収益' : lang === 'zh' ? '收入' : 'Revenue', value: `$${totalRevenue.toLocaleString()}`, accent: true },
    { label: lang === 'ja' ? '合計時間' : lang === 'zh' ? '总时长' : 'Hours', value: `${totalHours}h`, accent: false },
    { label: lang === 'ja' ? '平均単価' : lang === 'zh' ? '平均单价' : 'Avg/entry', value: `$${avgPerEntry}`, accent: false },
  ]

  return (
    <div style={{ background: tokens.bgCard, borderRadius: '16px', border: `1px solid ${tokens.border}`, padding: '1.5rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: tokens.text, margin: 0 }}>
          {lang === 'ja' ? '収益グラフ' : lang === 'zh' ? '收入图表' : 'Revenue'}
        </h2>
        <div style={{ display: 'flex', background: tokens.bgHover, borderRadius: '20px', padding: '3px' }}>
          {(['weekly', 'monthly'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ padding: '4px 14px', borderRadius: '18px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '500', fontFamily: 'inherit', background: view === v ? tokens.bgCard : 'transparent', color: view === v ? tokens.text : tokens.textTertiary }}>
              {v === 'weekly' ? (lang === 'ja' ? '週次' : lang === 'zh' ? '每周' : 'Weekly') : (lang === 'ja' ? '月次' : lang === 'zh' ? '每月' : 'Monthly')}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '1.5rem' }}>
        {metrics.map((m, i) => (
          <div key={i} style={{ background: tokens.bgHover, borderRadius: '12px', padding: '12px 14px' }}>
            <div style={{ fontSize: '11px', color: tokens.textTertiary, marginBottom: '4px', fontWeight: '500' }}>{m.label}</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: m.accent ? tokens.accent : tokens.text }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={{ height: '180px' }}>
        {entries.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: tokens.textTertiary, fontSize: '14px' }}>{lang === 'ja' ? 'まだデータがありません' : lang === 'zh' ? '暂无数据' : 'No data yet'}</p>
          </div>
        ) : <Bar data={chartData} options={options as any} />}
      </div>
    </div>
  )
}
