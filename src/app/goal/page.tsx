'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { useLang } from '@/contexts/LangContext'
import Sidebar from '@/components/Sidebar'

export default function GoalPage() {
  const [user, setUser] = useState<any>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [goalAmount, setGoalAmount] = useState('')
  const [goalCurrency, setGoalCurrency] = useState('USD')
  const [savedGoal, setSavedGoal] = useState(0)
  const [monthRevenue, setMonthRevenue] = useState(0)
  const [weekRevenue, setWeekRevenue] = useState(0)
  const [totalHours, setTotalHours] = useState(0)
  const [clientBreakdown, setClientBreakdown] = useState<{ name: string; revenue: number }[]>([])
  const { tokens } = useTheme()
  const { lang } = useLang()
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => { const check = () => setIsMobile(window.innerWidth < 768); check(); window.addEventListener('resize', check); return () => window.removeEventListener('resize', check) }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
      else { setUser(user); loadData(user.id) }
    })
    const saved = localStorage.getItem('flowly-goal')
    const savedCurrency = localStorage.getItem('flowly-goal-currency')
    if (saved) { setSavedGoal(Number(saved)); setGoalAmount(saved) }
    if (savedCurrency) setGoalCurrency(savedCurrency)
  }, [])

  async function loadData(uid: string) {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const [{ data: monthData }, { data: weekData }, { data: clients }] = await Promise.all([
      supabase.from('time_entries').select('duration_seconds, hourly_rate, client_id').eq('user_id', uid).gte('started_at', monthStart),
      supabase.from('time_entries').select('duration_seconds, hourly_rate').eq('user_id', uid).gte('started_at', weekStart),
      supabase.from('clients').select('id, name').eq('user_id', uid),
    ])

    if (monthData) {
      const total = monthData.reduce((s, e) => s + (e.duration_seconds / 3600) * (e.hourly_rate || 0), 0)
      const hours = monthData.reduce((s, e) => s + e.duration_seconds / 3600, 0)
      setMonthRevenue(Math.round(total))
      setTotalHours(Math.round(hours * 10) / 10)

      if (clients) {
        const breakdown = clients.map(c => ({
          name: c.name,
          revenue: Math.round(monthData.filter(e => e.client_id === c.id).reduce((s, e) => s + (e.duration_seconds / 3600) * (e.hourly_rate || 0), 0))
        })).filter(c => c.revenue > 0).sort((a, b) => b.revenue - a.revenue)
        setClientBreakdown(breakdown)
      }
    }
    if (weekData) {
      const total = weekData.reduce((s, e) => s + (e.duration_seconds / 3600) * (e.hourly_rate || 0), 0)
      setWeekRevenue(Math.round(total))
    }
  }

  function saveGoal() {
    setSavedGoal(Number(goalAmount))
    localStorage.setItem('flowly-goal', goalAmount)
    localStorage.setItem('flowly-goal-currency', goalCurrency)
  }

  const goal = savedGoal
  const progress = goal > 0 ? Math.min((monthRevenue / goal) * 100, 100) : 0
  const symbol = goalCurrency === 'JPY' ? '¥' : goalCurrency === 'EUR' ? '€' : goalCurrency === 'GBP' ? '£' : '$'
  const remaining = Math.max(goal - monthRevenue, 0)
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  const dayOfMonth = new Date().getDate()
  const daysLeft = daysInMonth - dayOfMonth
  const dailyNeeded = daysLeft > 0 ? Math.round(remaining / daysLeft) : 0
  const inp = { width: '100%', padding: '11px 14px', border: '1px solid ' + tokens.border, borderRadius: '12px', fontSize: '14px', boxSizing: 'border-box' as const, color: tokens.text, outline: 'none', fontFamily: 'inherit', background: tokens.bgHover }

  const sidebarW = isMobile ? 0 : (collapsed ? 56 : 232)

  if (!user) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: tokens.bg }}>
      <Sidebar userEmail={user.email || ''} onSignOut={async () => { await supabase.auth.signOut(); router.push('/login') }} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ marginLeft: sidebarW + 'px', flex: 1, padding: isMobile ? '4.5rem 1rem 1rem' : '2.5rem 3rem', transition: 'margin-left 0.22s cubic-bezier(0.4,0,0.2,1)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: tokens.text, margin: '0 0 6px', letterSpacing: '-0.6px' }}>
              {lang === 'ja' ? '目標収益トラッカー' : 'Revenue Goal'}
            </h1>
            <p style={{ fontSize: '15px', color: tokens.textSecondary, margin: 0 }}>
              {lang === 'ja' ? '今月の収益目標を設定して進捗を確認しましょう' : 'Set your monthly revenue goal and track progress'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '1.5rem' }}>
            {[
              { label: lang === 'ja' ? '今月の収益' : 'This month', value: symbol + monthRevenue.toLocaleString(), accent: true },
              { label: lang === 'ja' ? '今週の収益' : 'This week', value: symbol + weekRevenue.toLocaleString(), accent: false },
              { label: lang === 'ja' ? '今月の合計時間' : 'Hours this month', value: totalHours + 'h', accent: false },
            ].map((m, i) => (
              <div key={i} style={{ background: tokens.bgCard, borderRadius: '16px', padding: '1.25rem 1.5rem', border: '1px solid ' + tokens.border }}>
                <div style={{ fontSize: '12px', color: tokens.textTertiary, marginBottom: '6px', fontWeight: '500' }}>{m.label}</div>
                <div style={{ fontSize: '26px', fontWeight: '700', color: m.accent ? tokens.accent : tokens.text, letterSpacing: '-0.5px' }}>{m.value}</div>
              </div>
            ))}
          </div>

          <div style={{ background: tokens.bgCard, borderRadius: '18px', padding: '2rem', border: '1px solid ' + tokens.border, marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: tokens.text, marginBottom: '1.25rem' }}>
              {lang === 'ja' ? '月間目標を設定' : 'Set Monthly Goal'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', marginBottom: '12px' }}>
              <input style={inp} type="number" value={goalAmount} onChange={e => setGoalAmount(e.target.value)} placeholder={lang === 'ja' ? '例: 500000' : 'e.g. 5000'} />
              <select style={{ ...inp, width: 'auto' }} value={goalCurrency} onChange={e => setGoalCurrency(e.target.value)}>
                <option value="USD">USD</option><option value="JPY">JPY</option><option value="EUR">EUR</option><option value="GBP">GBP</option>
              </select>
            </div>
            <button onClick={saveGoal} style={{ width: '100%', padding: '12px', background: tokens.accent, color: '#08080F', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
              {lang === 'ja' ? '目標を設定する' : 'Set Goal'}
            </button>
          </div>

          {goal > 0 && (
            <div style={{ background: tokens.bgCard, borderRadius: '18px', padding: '2rem', border: '1px solid ' + tokens.border, marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '13px', color: tokens.textTertiary, marginBottom: '4px' }}>{lang === 'ja' ? '進捗' : 'Progress'}</div>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: tokens.text, letterSpacing: '-1px' }}>{Math.round(progress)}%</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', color: tokens.textTertiary, marginBottom: '4px' }}>{lang === 'ja' ? '目標' : 'Goal'}</div>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: tokens.textSecondary }}>{symbol}{goal.toLocaleString()}</div>
                </div>
              </div>
              <div style={{ height: '12px', background: tokens.bgHover, borderRadius: '6px', overflow: 'hidden', marginBottom: '1rem' }}>
                <div style={{ height: '100%', width: progress + '%', background: progress >= 100 ? tokens.success : `linear-gradient(90deg, ${tokens.accent}, #7DD3FC)`, borderRadius: '6px', transition: 'width 0.5s ease' }} />
              </div>
              {progress >= 100 ? (
                <div style={{ padding: '14px', background: tokens.successBg, borderRadius: '12px', textAlign: 'center', fontSize: '15px', fontWeight: '600', color: tokens.success }}>
                  🎉 {lang === 'ja' ? '目標達成！おめでとうございます！' : 'Goal achieved! Congratulations!'}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ padding: '12px 14px', background: tokens.bgHover, borderRadius: '12px' }}>
                    <div style={{ fontSize: '11px', color: tokens.textTertiary, marginBottom: '4px', fontWeight: '600' }}>{lang === 'ja' ? '残り金額' : 'Remaining'}</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: tokens.text }}>{symbol}{remaining.toLocaleString()}</div>
                  </div>
                  <div style={{ padding: '12px 14px', background: tokens.bgHover, borderRadius: '12px' }}>
                    <div style={{ fontSize: '11px', color: tokens.textTertiary, marginBottom: '4px', fontWeight: '600' }}>{lang === 'ja' ? '1日あたり必要' : 'Needed/day'}</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: dailyNeeded > monthRevenue ? tokens.danger : tokens.text }}>{symbol}{dailyNeeded.toLocaleString()}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {clientBreakdown.length > 0 && (
            <div style={{ background: tokens.bgCard, borderRadius: '18px', padding: '2rem', border: '1px solid ' + tokens.border }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: tokens.text, marginBottom: '1.25rem' }}>
                {lang === 'ja' ? 'クライアント別収益（今月）' : 'Revenue by Client (this month)'}
              </h2>
              {clientBreakdown.map((c, i) => (
                <div key={i} style={{ marginBottom: i < clientBreakdown.length - 1 ? '12px' : '0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', color: tokens.text, fontWeight: '500' }}>{c.name}</span>
                    <span style={{ fontSize: '13px', color: tokens.textSecondary }}>{symbol}{c.revenue.toLocaleString()}</span>
                  </div>
                  <div style={{ height: '6px', background: tokens.bgHover, borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: monthRevenue > 0 ? (c.revenue / monthRevenue * 100) + '%' : '0%', background: tokens.accent, borderRadius: '3px' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
