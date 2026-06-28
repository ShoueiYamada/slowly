'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { useLang } from '@/contexts/LangContext'
import { t } from '@/lib/i18n'
import Sidebar from '@/components/Sidebar'
import Timer from '@/components/Timer'
import TimeEntryList from '@/components/TimeEntryList'
import RevenueChart from '@/components/RevenueChart'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [refresh, setRefresh] = useState(0)
  const [collapsed, setCollapsed] = useState(false)
  const { tokens } = useTheme()
  const { lang } = useLang()
  const supabase = createClient()
  const router = useRouter()
  const tr = t[lang]

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
      else setUser(user)
    })
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!user) return null
  const sidebarW = collapsed ? 64 : 240

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: tokens.bg }}>
      <Sidebar userEmail={user.email || ''} onSignOut={handleSignOut} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ marginLeft: sidebarW + 'px', flex: 1, padding: '2.5rem 3rem', transition: 'margin-left 0.22s cubic-bezier(0.4,0,0.2,1)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: tokens.text, margin: '0 0 6px', letterSpacing: '-0.6px' }}>
              {lang === 'ja' ? 'ダッシュボード' : lang === 'zh' ? '工作台' : 'Dashboard'}
            </h1>
            <p style={{ fontSize: '15px', color: tokens.textSecondary, margin: 0 }}>
              {lang === 'ja' ? '今日も頑張りましょう' : lang === 'zh' ? '今天也加油吧' : 'Track your time, get paid faster'}
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
            <div>
              <RevenueChart userId={user.id} refresh={refresh} lang={lang} />
              <TimeEntryList userId={user.id} refresh={refresh} lang={lang} />
            </div>
            <div style={{ position: 'sticky', top: '2rem' }}>
              <Timer userId={user.id} onSaved={() => setRefresh(r => r + 1)} lang={lang} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
