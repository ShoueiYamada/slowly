'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Timer from '@/components/Timer'
import TimeEntryList from '@/components/TimeEntryList'
import { Lang, t } from '@/lib/i18n'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [refresh, setRefresh] = useState(0)
  const [lang, setLang] = useState<Lang>('en')
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

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
      <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderBottom: '0.5px solid #d2d2d7', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '52px' }}>
          <span style={{ fontSize: '17px', fontWeight: '700', color: '#1d1d1f', letterSpacing: '-0.3px' }}>Flowly</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['en', 'ja', 'zh'] as Lang[]).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  style={{ padding: '4px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '500', background: lang === l ? '#1d1d1f' : '#e8e8ed', color: lang === l ? '#fff' : '#6e6e73' }}>
                  {l === 'en' ? 'EN' : l === 'ja' ? '日本語' : '中文'}
                </button>
              ))}
            </div>
            <button onClick={() => router.push('/invoice')}
              style={{ padding: '7px 16px', background: '#0071e3', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
              {tr.createInvoice}
            </button>
            <button onClick={handleSignOut}
              style={{ padding: '7px 16px', background: 'none', border: '0.5px solid #d2d2d7', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', color: '#6e6e73' }}>
              {tr.logout}
            </button>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        <Timer userId={user.id} onSaved={() => setRefresh(r => r + 1)} lang={lang} />
        <TimeEntryList userId={user.id} refresh={refresh} lang={lang} />
      </div>
    </div>
  )
}
