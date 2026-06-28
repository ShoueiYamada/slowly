'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { Lang } from '@/lib/i18n'
import Sidebar from '@/components/Sidebar'

type Client = { id: string; name: string; hourly_rate: number; currency: string }

export default function FocusPage() {
  const [user, setUser] = useState<any>(null)
  const [lang, setLang] = useState<Lang>('en')
  const [collapsed, setCollapsed] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [clientId, setClientId] = useState('')
  const [description, setDescription] = useState('')

  const [pomodoroRunning, setPomodoroRunning] = useState(false)
  const [pomodoroPhase, setPomodoroPhase] = useState<'work' | 'break'>('work')
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60)
  const [pomodoroCount, setPomodoroCount] = useState(0)
  const [workMins, setWorkMins] = useState(25)
  const [breakMins, setBreakMins] = useState(5)
  const pomodoroInterval = useRef<any>(null)

  const [goalAmount, setGoalAmount] = useState('')
  const [goalCurrency, setGoalCurrency] = useState('USD')
  const [savedGoal, setSavedGoal] = useState(0)
  const [monthRevenue, setMonthRevenue] = useState(0)

  const { tokens } = useTheme()
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
      else { setUser(user); loadClients(user.id); loadMonthRevenue(user.id) }
    })
    return () => clearInterval(pomodoroInterval.current)
  }, [])

  async function loadClients(uid: string) {
    const { data } = await supabase.from('clients').select('*').eq('user_id', uid)
    if (data) setClients(data)
  }

  async function loadMonthRevenue(uid: string) {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const { data } = await supabase.from('time_entries').select('duration_seconds, hourly_rate').eq('user_id', uid).gte('started_at', start)
    if (data) {
      const total = data.reduce((s, e) => s + (e.duration_seconds / 3600) * (e.hourly_rate || 0), 0)
      setMonthRevenue(Math.round(total))
    }
  }

  function startPomodoro() {
    setPomodoroPhase('work')
    setPomodoroSeconds(workMins * 60)
    setPomodoroRunning(true)
    pomodoroInterval.current = setInterval(() => {
      setPomodoroSeconds(prev => {
        if (prev <= 1) {
          setPomodoroPhase(p => {
            const next = p === 'work' ? 'break' : 'work'
            setPomodoroSeconds(next === 'work' ? workMins * 60 : breakMins * 60)
            if (next === 'break') setPomodoroCount(c => c + 1)
            return next
          })
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  function stopPomodoro() {
    clearInterval(pomodoroInterval.current)
    setPomodoroRunning(false)
    setPomodoroPhase('work')
    setPomodoroSeconds(workMins * 60)
  }

  function fmtPomodoro(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const goal = Number(savedGoal) || 0
  const progress = goal > 0 ? Math.min((monthRevenue / goal) * 100, 100) : 0
  const symbol = goalCurrency === 'JPY' ? '¥' : goalCurrency === 'EUR' ? '€' : goalCurrency === 'GBP' ? '£' : '$'
  const sidebarW = collapsed ? 64 : 240

  const animStyle = `
    @keyframes flowGradient {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    .pomo-timer {
      font-size: 72px;
      font-weight: 200;
      letter-spacing: -3px;
      font-variant-numeric: tabular-nums;
      background: linear-gradient(90deg, #1e3a5f 0%, #38BDF8 25%, #e0f2fe 50%, #38BDF8 75%, #1e3a5f 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: flowGradient 4s linear infinite;
      line-height: 1;
    }
  `

  const inp = { width: '100%', padding: '10px 14px', border: '1px solid ' + tokens.border, borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' as const, color: tokens.text, outline: 'none', fontFamily: 'inherit', background: tokens.bgHover }

  if (!user) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: tokens.bg }}>
      <style>{animStyle}</style>
      <Sidebar userEmail={user.email || ''} onSignOut={async () => { await supabase.auth.signOut(); router.push('/login') }} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ marginLeft: sidebarW + 'px', flex: 1, padding: '2.5rem 3rem', transition: 'margin-left 0.22s cubic-bezier(0.4,0,0.2,1)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: tokens.text, margin: '0 0 6px', letterSpacing: '-0.6px' }}>
              {lang === 'ja' ? 'フォーカス' : 'Focus'}
            </h1>
            <p style={{ fontSize: '15px', color: tokens.textSecondary, margin: 0 }}>
              {lang === 'ja' ? 'ポモドーロタイマーと目標収益トラッカー' : 'Pomodoro timer and revenue goal tracker'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
            <div style={{ background: tokens.bgCard, borderRadius: '18px', padding: '2rem', border: '1px solid ' + tokens.border }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: tokens.text, margin: 0 }}>
                  {lang === 'ja' ? 'ポモドーロタイマー' : 'Pomodoro Timer'}
                </h2>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: pomodoroPhase === 'work' ? tokens.accentBg : tokens.successBg, color: pomodoroPhase === 'work' ? tokens.accentText : tokens.success, fontWeight: '700' }}>
                  {pomodoroPhase === 'work' ? (lang === 'ja' ? '作業中' : 'WORK') : (lang === 'ja' ? '休憩中' : 'BREAK')}
                </span>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div className="pomo-timer">{fmtPomodoro(pomodoroSeconds)}</div>
                <div style={{ fontSize: '13px', color: tokens.textTertiary, marginTop: '8px' }}>
                  {lang === 'ja' ? `完了セッション: ${pomodoroCount}` : `Sessions completed: ${pomodoroCount}`}
                </div>
              </div>

              {!pomodoroRunning && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: tokens.textTertiary, marginBottom: '4px', fontWeight: '600' }}>
                      {lang === 'ja' ? '作業時間（分）' : 'Work (min)'}
                    </label>
                    <input style={inp} type="number" value={workMins} onChange={e => { setWorkMins(Number(e.target.value)); setPomodoroSeconds(Number(e.target.value) * 60) }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: tokens.textTertiary, marginBottom: '4px', fontWeight: '600' }}>
                      {lang === 'ja' ? '休憩時間（分）' : 'Break (min)'}
                    </label>
                    <input style={inp} type="number" value={breakMins} onChange={e => setBreakMins(Number(e.target.value))} />
                  </div>
                </div>
              )}

              <button onClick={pomodoroRunning ? stopPomodoro : startPomodoro}
                style={{ width: '100%', padding: '13px', background: pomodoroRunning ? tokens.danger : tokens.accent, color: pomodoroRunning ? '#fff' : '#08080F', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                {pomodoroRunning
                  ? (lang === 'ja' ? '停止' : 'Stop')
                  : (lang === 'ja' ? 'スタート' : 'Start')}
              </button>
            </div>

            <div style={{ background: tokens.bgCard, borderRadius: '18px', padding: '2rem', border: '1px solid ' + tokens.border }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: tokens.text, marginBottom: '1.5rem' }}>
                {lang === 'ja' ? '今月の目標収益' : 'Monthly Revenue Goal'}
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: tokens.textTertiary, marginBottom: '4px', fontWeight: '600' }}>
                    {lang === 'ja' ? '目標金額' : 'Goal Amount'}
                  </label>
                  <input style={inp} type="number" value={goalAmount} onChange={e => setGoalAmount(e.target.value)} placeholder="5000" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: tokens.textTertiary, marginBottom: '4px', fontWeight: '600' }}>
                    {lang === 'ja' ? '通貨' : 'Currency'}
                  </label>
                  <select style={{ ...inp, width: 'auto' }} value={goalCurrency} onChange={e => setGoalCurrency(e.target.value)}>
                    <option value="USD">USD</option>
                    <option value="JPY">JPY</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>

              <button onClick={() => setSavedGoal(Number(goalAmount))}
                style={{ width: '100%', padding: '10px', background: tokens.accent, color: '#08080F', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '1.5rem' }}>
                {lang === 'ja' ? '目標を設定' : 'Set Goal'}
              </button>

              {goal > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: tokens.textSecondary }}>{lang === 'ja' ? '現在の収益' : 'Current revenue'}</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: tokens.accent }}>{symbol}{monthRevenue.toLocaleString()}</span>
                  </div>
                  <div style={{ height: '8px', background: tokens.bgHover, borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                    <div style={{ height: '100%', width: progress + '%', background: progress >= 100 ? tokens.success : tokens.accent, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: tokens.textTertiary }}>{Math.round(progress)}%</span>
                    <span style={{ fontSize: '12px', color: tokens.textTertiary }}>
                      {lang === 'ja' ? `目標: ${symbol}${goal.toLocaleString()}` : `Goal: ${symbol}${goal.toLocaleString()}`}
                    </span>
                  </div>
                  {progress >= 100 ? (
                    <div style={{ marginTop: '1rem', padding: '12px', background: tokens.successBg, borderRadius: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: tokens.success }}>
                      🎉 {lang === 'ja' ? '目標達成！おめでとうございます！' : 'Goal achieved! Congratulations!'}
                    </div>
                  ) : (
                    <div style={{ marginTop: '1rem', padding: '12px', background: tokens.bgHover, borderRadius: '12px', textAlign: 'center', fontSize: '13px', color: tokens.textSecondary }}>
                      {lang === 'ja' ? `あと ${symbol}${(goal - monthRevenue).toLocaleString()} で目標達成` : `${symbol}${(goal - monthRevenue).toLocaleString()} to go`}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
