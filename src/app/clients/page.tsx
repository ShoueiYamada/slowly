'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { useLang } from '@/contexts/LangContext'
import { t } from '@/lib/i18n'
import Sidebar from '@/components/Sidebar'
import UpgradeModal from '@/components/UpgradeModal'
import { getUsage, LIMITS } from '@/lib/plan'

type Client = { id: string; name: string; email: string; hourly_rate: number; currency: string; tax_rate: number }

export default function ClientsPage() {
  const [user, setUser] = useState<any>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Client | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [hourlyRate, setHourlyRate] = useState(75)
  const [currency, setCurrency] = useState('USD')
  const [taxRate, setTaxRate] = useState(0)
  const [transferMethod, setTransferMethod] = useState('wise')
  const [transferFeePercent, setTransferFeePercent] = useState(0.69)
  const [transferFeeFixed, setTransferFeeFixed] = useState(0)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [plan, setPlan] = useState<'free'|'pro'>('free')
  const { tokens } = useTheme()
  const { lang } = useLang()
  const supabase = createClient()
  const router = useRouter()
  const tr = t[lang]

  useEffect(() => { const check = () => setIsMobile(window.innerWidth < 768); check(); window.addEventListener('resize', check); return () => window.removeEventListener('resize', check) }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
      else { setUser(user); loadClients(user.id); getUsage(user.id).then(u => setPlan(u.plan)) }
    })
  }, [])

  async function loadClients(uid: string) {
    const { data } = await supabase.from('clients').select('*').eq('user_id', uid).order('created_at', { ascending: false })
    if (data) setClients(data)
  }

  function openAdd() {
    if (plan === 'free' && clients.length >= LIMITS.free.clients) { setShowUpgrade(true); return }
    setEditTarget(null); setName(''); setEmail(''); setHourlyRate(75); setCurrency('USD'); setTaxRate(0); setTransferMethod('wise'); setTransferFeePercent(0.69); setTransferFeeFixed(0); setMessage(''); setShowForm(true)
  }
  function openEdit(c: Client) { setEditTarget(c); setName(c.name); setEmail(c.email || ''); setHourlyRate(c.hourly_rate); setCurrency(c.currency); setTaxRate(c.tax_rate || 0); setTransferMethod((c as any).transfer_method || 'wise'); setTransferFeePercent((c as any).transfer_fee_percent || 0.69); setTransferFeeFixed((c as any).transfer_fee_fixed || 0); setMessage(''); setShowForm(true) }

  async function saveClient() {
    if (!name.trim()) { setMessage(lang === 'ja' ? '名前を入力してください' : 'Please enter a name'); return }
    setSaving(true)
    const payload = { name, email, hourly_rate: hourlyRate, currency, tax_rate: taxRate, transfer_method: transferMethod, transfer_fee_percent: transferFeePercent, transfer_fee_fixed: transferFeeFixed }
    if (editTarget) {
      const { error } = await supabase.from('clients').update(payload).eq('id', editTarget.id)
      if (!error) { setShowForm(false); loadClients(user.id) } else setMessage(error.message)
    } else {
      const { error } = await supabase.from('clients').insert({ ...payload, user_id: user.id })
      if (!error) { setShowForm(false); loadClients(user.id) } else setMessage(error.message)
    }
    setSaving(false)
  }

  async function deleteClient(id: string) {
    if (!window.confirm(lang === 'ja' ? '削除しますか？' : 'Delete this client?')) return
    await supabase.from('clients').delete().eq('id', id)
    loadClients(user.id)
  }

  const symbol = (c: string) => c === 'JPY' ? '¥' : c === 'EUR' ? '€' : c === 'GBP' ? '£' : '$'
  const inp = { width: '100%', padding: '11px 14px', border: '1px solid ' + tokens.border, borderRadius: '10px', fontSize: '15px', boxSizing: 'border-box' as const, color: tokens.text, outline: 'none', fontFamily: 'inherit', background: tokens.bgHover }
  const lbl = { display: 'block' as const, fontSize: '13px', color: tokens.textTertiary, marginBottom: '6px', fontWeight: '500' as const }

  const sidebarW = isMobile ? 0 : (collapsed ? 56 : 232)

  if (!user) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: tokens.bg, overflowX: 'hidden' }}>
      {showUpgrade && <UpgradeModal reason='clients' onClose={() => setShowUpgrade(false)} />}
      <Sidebar userEmail={user.email || ''} onSignOut={async () => { await supabase.auth.signOut(); router.push('/login') }} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ marginLeft: sidebarW + 'px', flex: 1, minWidth: 0, overflowX: 'hidden', padding: isMobile ? '4.5rem 1rem 1.5rem' : '2.5rem 3rem', transition: 'margin-left 0.22s cubic-bezier(0.4,0,0.2,1)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: tokens.text, margin: '0 0 6px', letterSpacing: '-0.6px' }}>
                {lang === 'ja' ? 'クライアント'  : 'Clients'}
              </h1>
              <p style={{ fontSize: '15px', color: tokens.textSecondary, margin: 0 }}>
                {lang === 'ja' ? clients.length + '件のクライアント' : clients.length + ' client' + (clients.length !== 1 ? 's' : '')}
              </p>
            </div>
            <button onClick={openAdd} style={{ padding: '11px 22px', background: tokens.accent, color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', fontFamily: 'inherit' }}>
              {lang === 'ja' ? '+ 追加'  : '+ Add Client'}
            </button>
          </div>

          {showForm && (
            <div style={{ background: tokens.bgCard, borderRadius: '18px', padding: '2rem', border: '1px solid ' + tokens.borderStrong, marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: tokens.text, marginBottom: '1.5rem' }}>
                {editTarget ? (lang === 'ja' ? '編集' : 'Edit Client') : (lang === 'ja' ? '新規クライアント' : 'New Client')}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div style={{ gridColumn: '1 / -1' }}><label style={lbl}>{lang === 'ja' ? 'クライアント名' : 'Client Name'}</label><input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="Acme Corp" /></div>
                <div style={{ gridColumn: '1 / -1' }}><label style={lbl}>{lang === 'ja' ? 'メール' : 'Email'}</label><input style={inp} value={email} onChange={e => setEmail(e.target.value)} placeholder="billing@acme.com" /></div>
                <div><label style={lbl}>{tr.hourlyRate}</label><input style={inp} type="number" value={hourlyRate} onChange={e => setHourlyRate(Number(e.target.value))} /></div>
                <div><label style={lbl}>{tr.currency}</label>
                  <select style={inp} value={currency} onChange={e => setCurrency(e.target.value)}>
                    <option value="USD">USD ($)</option><option value="JPY">JPY (¥)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div><label style={lbl}>{tr.taxRate}</label><input style={inp} type="number" value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} placeholder="0" /></div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={lbl}>{lang === 'ja' ? '送金方法' : 'Transfer Method'}</label>
                  <select style={inp} value={transferMethod} onChange={e => {
                    const m = e.target.value
                    setTransferMethod(m)
                    if (m === 'wise') { setTransferFeePercent(0.69); setTransferFeeFixed(0) }
                    else if (m === 'paypal') { setTransferFeePercent(3.5); setTransferFeeFixed(0) }
                    else if (m === 'bank') { setTransferFeePercent(0); setTransferFeeFixed(25) }
                    else { setTransferFeePercent(0); setTransferFeeFixed(0) }
                  }}>
                    <option value="wise">Wise（約0.69%）</option>
                    <option value="paypal">PayPal（約3.5%）</option>
                    <option value="bank">{lang === 'ja' ? '銀行送金（固定$25）' : 'Bank Transfer ($25 fixed)'}</option>
                    <option value="custom">{lang === 'ja' ? 'カスタム' : 'Custom'}</option>
                  </select>
                </div>
                {transferMethod === 'custom' && (
                  <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={lbl}>{lang === 'ja' ? '手数料率（%）' : 'Fee (%)'}</label>
                      <input style={inp} type="number" step="0.01" value={transferFeePercent} onChange={e => setTransferFeePercent(Number(e.target.value))} placeholder="0.69" />
                    </div>
                    <div>
                      <label style={lbl}>{lang === 'ja' ? '固定手数料（USD）' : 'Fixed Fee (USD)'}</label>
                      <input style={inp} type="number" step="0.01" value={transferFeeFixed} onChange={e => setTransferFeeFixed(Number(e.target.value))} placeholder="0" />
                    </div>
                  </div>
                )}
              </div>
              {message && <p style={{ fontSize: '14px', color: tokens.danger, marginBottom: '14px' }}>{message}</p>}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={saveClient} disabled={saving} style={{ flex: 1, padding: '12px', background: saving ? tokens.textTertiary : tokens.accent, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {saving ? '...' : lang === 'ja' ? '保存' : 'Save'}
                </button>
                <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid ' + tokens.border, borderRadius: '12px', fontSize: '15px', cursor: 'pointer', color: tokens.textSecondary, fontFamily: 'inherit' }}>
                  {lang === 'ja' ? 'キャンセル' : 'Cancel'}
                </button>
              </div>
            </div>
          )}

          <div style={{ background: tokens.bgCard, borderRadius: '18px', border: '1px solid ' + tokens.border, overflow: 'hidden' }}>
            {clients.length === 0 ? (
              <div style={{ padding: '5rem', textAlign: 'center' }}>
                <p style={{ color: tokens.textTertiary, fontSize: '16px', marginBottom: '1.5rem' }}>{lang === 'ja' ? 'クライアントがまだいません' : 'No clients yet'}</p>
                <button onClick={openAdd} style={{ padding: '12px 24px', background: tokens.accent, color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '600' }}>
                  {lang === 'ja' ? '+ 最初のクライアントを追加' : '+ Add your first client'}
                </button>
              </div>
            ) : clients.map((c, i) => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '1.25rem 1.75rem', borderBottom: i < clients.length - 1 ? '1px solid ' + tokens.border : 'none' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: tokens.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700', color: tokens.accent, flexShrink: 0 }}>
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: tokens.text, marginBottom: '3px' }}>{c.name}</div>
                  <div style={{ fontSize: '13px', color: tokens.textTertiary }}>{c.email || '—'} · {symbol(c.currency)}{c.hourly_rate}/h · Tax {c.tax_rate || 0}%</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => openEdit(c)} style={{ padding: '8px 18px', background: tokens.bgHover, border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: tokens.textSecondary, fontFamily: 'inherit' }}>{lang === 'ja' ? '編集' : 'Edit'}</button>
                  <button onClick={() => deleteClient(c.id)} style={{ padding: '8px 18px', background: tokens.dangerBg, border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: tokens.danger, fontFamily: 'inherit' }}>{lang === 'ja' ? '削除' : 'Delete'}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
