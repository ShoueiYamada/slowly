'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { useLang } from '@/contexts/LangContext'
import Sidebar from '@/components/Sidebar'

export default function PricingPage() {
  const [user, setUser] = useState<any>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<'free' | 'pro'>('free')
  const { tokens } = useTheme()
  const { lang } = useLang()
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => { const check = () => setIsMobile(window.innerWidth < 768); check(); window.addEventListener('resize', check); return () => window.removeEventListener('resize', check) }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
      else {
        setUser(user)
        supabase.from('profiles').select('plan').eq('id', user.id).single()
          .then(({ data }) => setPlan(data?.plan || 'free'))
      }
    })

    if (window.location.search.includes('upgraded=true')) {
      setPlan('pro')
    }
  }, [])

  async function handleUpgrade() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const freeFeatures = lang === 'ja'
    ? ['クライアント5件まで', '請求書10件/月', 'AI督促メール5回/月', 'タイマー・ダッシュボード', 'ポモドーロ・目標収益']
    : ['Up to 5 clients', '10 invoices / month', '5 AI reminders / month', 'Timer & dashboard', 'Pomodoro & revenue goal']

  const proFeatures = lang === 'ja'
    ? ['クライアント無制限', '請求書無制限', 'AI督促メール無制限', 'PDFロゴなし', '優先サポート', '月次レポート（近日公開）']
    : ['Unlimited clients', 'Unlimited invoices', 'Unlimited AI reminders', 'PDF without Flowly logo', 'Priority support', 'Monthly reports (coming soon)']

  const sidebarW = isMobile ? 0 : (collapsed ? 56 : 232)

  if (!user) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: tokens.bg }}>
      <Sidebar userEmail={user.email || ''} onSignOut={async () => { await supabase.auth.signOut(); router.push('/login') }} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ marginLeft: sidebarW + 'px', flex: 1, padding: isMobile ? '4.5rem 1rem 1rem' : '2.5rem 3rem', transition: 'margin-left 0.22s cubic-bezier(0.4,0,0.2,1)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '800', color: tokens.text, margin: '0 0 10px', letterSpacing: '-1px' }}>
              {lang === 'ja' ? 'シンプルな料金体系' : 'Simple, honest pricing'}
            </h1>
            <p style={{ fontSize: '16px', color: tokens.textSecondary }}>
              {lang === 'ja' ? '隠れた費用なし。いつでもキャンセル可能。' : 'No hidden fees. Cancel anytime.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: tokens.bgCard, borderRadius: '20px', padding: '2rem', border: '1px solid ' + tokens.border }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: tokens.textTertiary, letterSpacing: '0.06em', marginBottom: '1rem' }}>FREE</div>
              <div style={{ fontSize: '48px', fontWeight: '800', color: tokens.text, letterSpacing: '-2px', marginBottom: '4px' }}>$0</div>
              <div style={{ fontSize: '14px', color: tokens.textTertiary, marginBottom: '2rem' }}>
                {lang === 'ja' ? '永久無料' : 'forever'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '2rem' }}>
                {freeFeatures.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: tokens.textSecondary }}>
                    <span style={{ color: tokens.textTertiary, fontSize: '15px' }}>✓</span>{f}
                  </div>
                ))}
              </div>
              {plan === 'free' ? (
                <div style={{ width: '100%', padding: '12px', background: tokens.bgHover, borderRadius: '12px', fontSize: '14px', fontWeight: '600', color: tokens.textSecondary, textAlign: 'center' }}>
                  {lang === 'ja' ? '現在のプラン' : 'Current plan'}
                </div>
              ) : (
                <div style={{ width: '100%', padding: '12px', background: tokens.bgHover, borderRadius: '12px', fontSize: '14px', color: tokens.textTertiary, textAlign: 'center' }}>
                  {lang === 'ja' ? 'ダウングレード' : 'Downgrade'}
                </div>
              )}
            </div>

            <div style={{ background: 'rgba(56,189,248,0.08)', borderRadius: '20px', padding: '2rem', border: '2px solid rgba(56,189,248,0.35)', position: 'relative' }}>
              <span style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', fontSize: '11px', fontWeight: '700', padding: '4px 14px', borderRadius: '20px', background: '#38BDF8', color: '#08080F', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                {lang === 'ja' ? '一番人気' : 'MOST POPULAR'}
              </span>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#38BDF8', letterSpacing: '0.06em', marginBottom: '1rem' }}>PRO</div>
              <div style={{ fontSize: '48px', fontWeight: '800', color: tokens.text, letterSpacing: '-2px', marginBottom: '4px' }}>$19</div>
              <div style={{ fontSize: '14px', color: tokens.textTertiary, marginBottom: '2rem' }}>
                {lang === 'ja' ? '月額' : 'per month'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '2rem' }}>
                {proFeatures.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: tokens.text }}>
                    <span style={{ color: '#38BDF8', fontSize: '15px' }}>✓</span>{f}
                  </div>
                ))}
              </div>
              {plan === 'pro' ? (
                <div style={{ width: '100%', padding: '13px', background: 'rgba(56,189,248,0.15)', borderRadius: '12px', fontSize: '14px', fontWeight: '700', color: '#38BDF8', textAlign: 'center' }}>
                  {lang === 'ja' ? '✓ 現在のプラン' : '✓ Current plan'}
                </div>
              ) : (
                <button onClick={handleUpgrade} disabled={loading}
                  style={{ width: '100%', padding: '13px', background: loading ? '#1e3a5f' : '#38BDF8', color: '#08080F', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                  {loading ? (lang === 'ja' ? '処理中...' : 'Processing...') : (lang === 'ja' ? 'Proにアップグレード' : 'Upgrade to Pro')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
