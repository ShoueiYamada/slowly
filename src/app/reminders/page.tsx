'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { Lang } from '@/lib/i18n'
import { useLang } from '@/contexts/LangContext'
import Sidebar from '@/components/Sidebar'
import UpgradeModal from '@/components/UpgradeModal'
import { getUsage, LIMITS, incrementReminderCount } from '@/lib/plan'

type Client = { id: string; name: string; email: string; hourly_rate: number; currency: string }

export default function RemindersPage() {
  const [user, setUser] = useState<any>(null)
  const [clients, setClients] = useState<Client[]>([])
  const { lang, setLang } = useLang()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState('')
  const [invoiceNum, setInvoiceNum] = useState('')
  const [amount, setAmount] = useState('')
  const [daysOverdue, setDaysOverdue] = useState(14)
  const [tone, setTone] = useState<'soft' | 'firm' | 'strong'>('firm')
  const [fromName, setFromName] = useState('')
  const [loading, setLoading] = useState(false)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [copied, setCopied] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [plan, setPlan] = useState<'free'|'pro'>('free')
  const [reminderCount, setReminderCount] = useState(0)
  const { tokens } = useTheme()
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => { const check = () => setIsMobile(window.innerWidth < 768); check(); window.addEventListener('resize', check); return () => window.removeEventListener('resize', check) }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
      else { setUser(user); loadClients(user.id); getUsage(user.id).then(u => { setPlan(u.plan); setReminderCount(u.reminderCount) }) }
    })
  }, [])

  async function loadClients(uid: string) {
    const { data } = await supabase.from('clients').select('*').eq('user_id', uid)
    if (data) setClients(data)
  }

  const selectedClient = clients.find(c => c.id === selectedClientId)

  async function generate() {
    if (!selectedClientId || !amount) return
    if (plan === 'free' && reminderCount >= LIMITS.free.remindersPerMonth) { setShowUpgrade(true); return }
    setLoading(true)
    setSubject(''); setBody('')
    try {
      const res = await fetch('/api/draft-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: selectedClient?.name,
          invoiceNum: invoiceNum || '—',
          amount: Number(amount),
          currency: selectedClient?.currency || 'USD',
          daysOverdue,
          tone,
          lang,
          fromName,
          fromEmail: user?.email,
        }),
      })
      const data = await res.json()
      if (data.error) { setBody('Error: ' + data.error); setLoading(false); return }
      setSubject(data.subject)
      setBody(data.body)
      await incrementReminderCount(user.id)
      setReminderCount(c => c + 1)
    } catch (e) {
      setBody('Error generating email. Please try again.')
    }
    setLoading(false)
  }

  async function copyAll() {
    await navigator.clipboard.writeText('Subject: ' + subject + '\n\n' + body)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const inp = { width: '100%', padding: '11px 14px', border: '1px solid ' + tokens.border, borderRadius: '12px', fontSize: '14px', boxSizing: 'border-box' as const, color: tokens.text, outline: 'none', fontFamily: 'inherit', background: tokens.bgHover }
  const lbl = { display: 'block' as const, fontSize: '12px', color: tokens.textTertiary, marginBottom: '6px', fontWeight: '600' as const, letterSpacing: '0.03em' }

  const tones = [
    { key: 'soft', label: lang === 'ja' ? 'やわらかめ' : lang === 'zh' ? '温和' : 'Gentle', desc: lang === 'ja' ? '初回の督促に' : 'First reminder' },
    { key: 'firm', label: lang === 'ja' ? '毅然と' : lang === 'zh' ? '坚定' : 'Firm', desc: lang === 'ja' ? '2回目以降に' : 'Second reminder' },
    { key: 'strong', label: lang === 'ja' ? '強め' : lang === 'zh' ? '强硬' : 'Strong', desc: lang === 'ja' ? '最終警告に' : 'Final warning' },
  ]

  const sidebarW = isMobile ? 0 : (collapsed ? 56 : 232)

  if (!user) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: tokens.bg }}>
      {showUpgrade && <UpgradeModal reason='reminders' onClose={() => setShowUpgrade(false)} />}
      <Sidebar userEmail={user.email || ''} onSignOut={async () => { await supabase.auth.signOut(); router.push('/login') }} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ marginLeft: sidebarW + 'px', flex: 1, padding: isMobile ? '4.5rem 1rem 1rem' : '2.5rem 3rem', transition: 'margin-left 0.22s cubic-bezier(0.4,0,0.2,1)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: tokens.text, margin: '0 0 6px', letterSpacing: '-0.6px' }}>
              {lang === 'ja' ? 'AI督促メール' : lang === 'zh' ? 'AI催款邮件' : 'AI Payment Reminder'}
            </h1>
            <p style={{ fontSize: '15px', color: tokens.textSecondary, margin: 0 }}>
              {lang === 'ja' ? '未払いクライアントへの督促メールをAIが自動生成します' : lang === 'zh' ? 'AI自动生成催款邮件' : 'Let AI draft the awkward email for you'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
            <div>
              <div style={{ background: tokens.bgCard, borderRadius: '18px', padding: '1.75rem', border: '1px solid ' + tokens.border, marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: tokens.text, marginBottom: '1.25rem' }}>
                  {lang === 'ja' ? '送信者情報' : lang === 'zh' ? '发件人信息' : 'Your Info'}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={lbl}>{lang === 'ja' ? 'あなたの名前' : 'Your Name'}</label>
                    <input style={inp} value={fromName} onChange={e => setFromName(e.target.value)} placeholder={lang === 'ja' ? '山田 翔英' : 'John Doe'} />
                  </div>
                  <div>
                    <label style={lbl}>{lang === 'ja' ? 'メール（自動入力）' : 'Email (auto)'}</label>
                    <input style={{ ...inp, opacity: 0.6 }} value={user?.email || ''} disabled />
                  </div>
                </div>
              </div>

              <div style={{ background: tokens.bgCard, borderRadius: '18px', padding: '1.75rem', border: '1px solid ' + tokens.border, marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: tokens.text, marginBottom: '1.25rem' }}>
                  {lang === 'ja' ? '請求情報' : lang === 'zh' ? '账单信息' : 'Invoice Details'}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={lbl}>{lang === 'ja' ? 'クライアント' : 'Client'}</label>
                    <select style={inp} value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)}>
                      <option value="">{lang === 'ja' ? 'クライアントを選択...' : 'Select client...'}</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  {selectedClient && (
                    <div style={{ padding: '10px 14px', background: tokens.accentBg, borderRadius: '10px', fontSize: '13px', color: tokens.accentText }}>
                      {selectedClient.email} · {selectedClient.currency}
                    </div>
                  )}
                  <div>
                    <label style={lbl}>{lang === 'ja' ? '請求書番号' : 'Invoice #'}</label>
                    <input style={inp} value={invoiceNum} onChange={e => setInvoiceNum(e.target.value)} placeholder="0001" />
                  </div>
                  <div>
                    <label style={lbl}>{lang === 'ja' ? '未払い金額' : 'Amount Due'}</label>
                    <input style={inp} type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="1000" />
                  </div>
                  <div>
                    <label style={lbl}>{lang === 'ja' ? '支払い遅延日数' : 'Days Overdue'}</label>
                    <input style={inp} type="number" value={daysOverdue} onChange={e => setDaysOverdue(Number(e.target.value))} />
                  </div>
                </div>
              </div>

              <div style={{ background: tokens.bgCard, borderRadius: '18px', padding: '1.75rem', border: '1px solid ' + tokens.border, marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: tokens.text, marginBottom: '1.25rem' }}>
                  {lang === 'ja' ? 'トーンを選択' : 'Email Tone'}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {tones.map(t => (
                    <button key={t.key} onClick={() => setTone(t.key as any)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid ' + (tone === t.key ? tokens.accent : tokens.border), background: tone === t.key ? tokens.bgActive : tokens.bgHover, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: tone === t.key ? tokens.accent : tokens.text }}>{t.label}</div>
                        <div style={{ fontSize: '12px', color: tokens.textTertiary, marginTop: '2px' }}>{t.desc}</div>
                      </div>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid ' + (tone === t.key ? tokens.accent : tokens.border), background: tone === t.key ? tokens.accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {tone === t.key && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#fff' }} />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={generate} disabled={loading || !selectedClientId || !amount}
                style={{ width: '100%', padding: '14px', background: (!selectedClientId || !amount) ? tokens.textTertiary : tokens.accent, color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '700', cursor: (!selectedClientId || !amount) ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {loading
                  ? (lang === 'ja' ? 'AI生成中...' : 'AI is writing...')
                  : (lang === 'ja' ? 'AIでメールを生成' : 'Generate with AI')}
              </button>
            </div>

            <div style={{ position: 'sticky', top: '2rem' }}>
              <div style={{ background: tokens.bgCard, borderRadius: '18px', border: '1px solid ' + tokens.border, overflow: 'hidden', minHeight: '500px' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid ' + tokens.border, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: '600', color: tokens.text, margin: 0 }}>
                    {lang === 'ja' ? '生成されたメール' : 'Generated Email'}
                  </h2>
                  {body && !body.startsWith('Error') && (
                    <button onClick={copyAll}
                      style={{ padding: '6px 14px', background: copied ? tokens.successBg : tokens.bgHover, border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: copied ? tokens.success : tokens.textSecondary, fontFamily: 'inherit' }}>
                      {copied ? (lang === 'ja' ? 'コピー済み!' : 'Copied!') : (lang === 'ja' ? 'コピー' : 'Copy all')}
                    </button>
                  )}
                </div>

                {loading ? (
                  <div style={{ padding: '4rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '13px', color: tokens.textTertiary, marginBottom: '1.5rem' }}>
                      {lang === 'ja' ? 'AIがメールを作成中...' : 'AI is crafting your email...'}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: tokens.accent, opacity: 0.3 + i * 0.2 }} />
                      ))}
                    </div>
                  </div>
                ) : body ? (
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1.25rem', padding: '12px 14px', background: tokens.bgHover, borderRadius: '10px' }}>
                      <div style={{ fontSize: '11px', color: tokens.textTertiary, marginBottom: '4px', fontWeight: '600', letterSpacing: '0.05em' }}>SUBJECT</div>
                      <input value={subject} onChange={e => setSubject(e.target.value)}
                        style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '14px', fontWeight: '600', color: tokens.text, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ height: '1px', background: tokens.border, marginBottom: '1.25rem' }} />
                    <textarea value={body} onChange={e => setBody(e.target.value)}
                      style={{ width: '100%', minHeight: '360px', padding: '0', border: 'none', background: 'transparent', color: tokens.text, fontSize: '14px', lineHeight: '1.8', fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                    <div style={{ marginTop: '1rem', padding: '10px 14px', background: tokens.bgHover, borderRadius: '10px', fontSize: '12px', color: tokens.textTertiary }}>
                      {lang === 'ja' ? '✏️ 直接編集できます。コピーしてメールに貼り付けてください。' : '✏️ Edit directly, then copy to your email client.'}
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '1rem' }}>✉️</div>
                    <p style={{ color: tokens.textTertiary, fontSize: '14px', lineHeight: '1.7' }}>
                      {lang === 'ja' ? 'クライアントと金額を選んで\n「AIでメールを生成」を押してください' : 'Select a client and amount,\nthen click Generate'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
