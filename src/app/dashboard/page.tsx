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
import UsageBanner from '@/components/UsageBanner'
import ExchangeRates from '@/components/ExchangeRates'
import NetRevenueCard from '@/components/NetRevenueCard'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [refresh, setRefresh] = useState(0)
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { tokens } = useTheme()
  const { lang } = useLang()
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => { const check = () => setIsMobile(window.innerWidth < 768); check(); window.addEventListener('resize', check); return () => window.removeEventListener('resize', check) }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
      else setUser(user)
    })
  }, [])

  const sidebarW = isMobile ? 0 : (collapsed ? 56 : 232)

  if (!user) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: tokens.bg, overflowX: 'hidden' }}>
      <Sidebar userEmail={user.email || ''} onSignOut={async () => { await supabase.auth.signOut(); router.push('/login') }} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ marginLeft: sidebarW + 'px', flex: 1, minWidth: 0, overflowX: 'hidden', transition: 'margin-left 0.2s cubic-bezier(0.4,0,0.2,1)', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '4.5rem 1rem 1rem' : '2rem 2.5rem' }}>
          <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid ' + tokens.border }}>
            <h1 style={{ fontSize: '20px', fontWeight: '600', color: tokens.text, margin: '0 0 3px', letterSpacing: '-0.4px' }}>
              {lang === 'ja' ? 'ダッシュボード'  : 'Dashboard'}
            </h1>
            <p style={{ fontSize: '13px', color: tokens.textTertiary, margin: 0 }}>
              {lang === 'ja' ? '今日も頑張りましょう'  : 'Track your time, get paid faster'}
            </p>
          </div>

          <UsageBanner userId={user.id} />
          <ExchangeRates />
          <NetRevenueCard userId={user.id} refresh={refresh} />

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <RevenueChart userId={user.id} refresh={refresh} lang={lang} />
              <TimeEntryList userId={user.id} refresh={refresh} lang={lang} />
            </div>
            <div style={{ position: isMobile ? 'static' : 'sticky', top: '1.5rem' }}>
              <Timer userId={user.id} onSaved={() => setRefresh(r => r + 1)} lang={lang} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
