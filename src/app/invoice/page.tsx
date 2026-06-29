'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { Lang, t } from '@/lib/i18n'
import { useLang } from '@/contexts/LangContext'
import Sidebar from '@/components/Sidebar'
import dynamic from 'next/dynamic'

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(m => m.PDFDownloadLink),
  { ssr: false }
)
import InvoicePDF from '@/components/InvoicePDF'

type Entry = { id: string; description: string; duration_seconds: number; started_at: string; client_id: string | null }
type Client = { id: string; name: string; email: string; hourly_rate: number; currency: string; tax_rate: number }

export default function InvoicePage() {
  const [user, setUser] = useState<any>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const { lang, setLang } = useLang()
  const [collapsed, setCollapsed] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState('')
  const [fromName, setFromName] = useState('')
  const [fromEmail, setFromEmail] = useState('')
  const [toName, setToName] = useState('')
  const [toEmail, setToEmail] = useState('')
  const [hourlyRate, setHourlyRate] = useState(75)
  const [currency, setCurrency] = useState('USD')
  const [taxRate, setTaxRate] = useState(0)
  const [invoiceNum, setInvoiceNum] = useState('0001')
  const [ready, setReady] = useState(false)
  const { tokens } = useTheme()
  const supabase = createClient()
  const router = useRouter()
  const tr = t[lang]

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
      else {
        setUser(user)
        setFromEmail(user.email || '')
        loadEntries(user.id)
        loadClients(user.id)
      }
    })
  }, [])

  async function loadEntries(uid: string) {
    const { data } = await supabase.from('time_entries').select('*').eq('user_id', uid).order('started_at', { ascending: false })
    if (data) setEntries(data)
  }

  async function loadClients(uid: string) {
    const { data } = await supabase.from('clients').select('*').eq('user_id', uid)
    if (data) setClients(data)
  }

  function handleClientSelect(clientId: string) {
    setSelectedClientId(clientId)
    setReady(false)
    if (!clientId) return
    const c = clients.find(c => c.id === clientId)
    if (!c) return
    setToName(c.name)
    setToEmail(c.email || '')
    setHourlyRate(c.hourly_rate)
    setCurrency(c.currency)
    setTaxRate(c.tax_rate || 0)
    const clientEntries = entries.filter(e => e.client_id === clientId)
    if (clientEntries.length > 0) setSelected(clientEntries.map(e => e.id))
  }

  function toggleSelect(id: string) {
    setReady(false)
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  function selectAll() { setReady(false); setSelected(entries.map(e => e.id)) }

  const selectedEntries = entries.filter(e => selected.includes(e.id))
  const totalSeconds = selectedEntries.reduce((s, e) => s + e.duration_seconds, 0)
  const totalHours = totalSeconds / 3600
  const symbol = currency === 'JPY' ? '¥' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'
  const subtotal = totalHours * hourlyRate
  const tax = subtotal * (taxRate / 100)
  const total = subtotal + tax

  function fmtH(s: number) { const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); return `${h}h ${String(m).padStart(2, '0')}m` }
  function fmtDate(iso: string) { const d = new Date(iso); return `${d.getMonth() + 1}/${d.getDate()}` }

  const inp = { width: '100%', padding: '11px 14px', border: '1px solid ' + tokens.border, borderRadius: '12px', fontSize: '14px', boxSizing: 'border-box' as const, color: tokens.text, outline: 'none', fontFamily: 'inherit', background: tokens.bgHover }
  const lbl = { display: 'block' as const, fontSize: '12px', color: tokens.textTertiary, marginBottom: '6px', fontWeight: '500' as const }

  if (!user) return null
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  const sidebarW = isMobile ? 0 : (collapsed ? 56 : 232)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: tokens.bg }}>
      <Sidebar userEmail={user.email || ''} onSignOut={async () => { await supabase.auth.signOut(); router.push('/login') }} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ marginLeft: sidebarW + 'px', flex: 1, padding: isMobile ? '4.5rem 1rem 1rem' : '2.5rem 3rem', transition: 'margin-left 0.22s cubic-bezier(0.4,0,0.2,1)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: tokens.text, margin: '0 0 6px', letterSpacing: '-0.6px' }}>
              {tr.createInvoice}
            </h1>
            <p style={{ fontSize: '15px', color: tokens.textSecondary, margin: 0 }}>
              {lang === 'ja' ? '作業ログから請求書を自動生成' : lang === 'zh' ? '从工作记录自动生成发票' : 'Auto-generate invoices from your time logs'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start' }}>
            <div>
              <div style={{ background: tokens.bgCard, borderRadius: '18px', padding: '1.75rem', border: '1px solid ' + tokens.border, marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: tokens.text, marginBottom: '1.25rem' }}>
                  {lang === 'ja' ? 'クライアントを選択' : lang === 'zh' ? '选择客户' : 'Select Client'}
                </h2>
                <select style={{ ...inp, marginBottom: '0' }} value={selectedClientId} onChange={e => handleClientSelect(e.target.value)}>
                  <option value="">{lang === 'ja' ? 'クライアントを選ぶと自動入力されます' : lang === 'zh' ? '选择客户后自动填写' : 'Choose a client to auto-fill details'}</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {selectedClientId && (
                  <div style={{ marginTop: '12px', padding: '12px 14px', background: tokens.accentBg, borderRadius: '10px', display: 'flex', gap: '16px' }}>
                    <div style={{ fontSize: '13px', color: tokens.accentText }}><span style={{ opacity: 0.7 }}>Rate: </span><strong>{symbol}{hourlyRate}/h</strong></div>
                    <div style={{ fontSize: '13px', color: tokens.accentText }}><span style={{ opacity: 0.7 }}>Tax: </span><strong>{taxRate}%</strong></div>
                    <div style={{ fontSize: '13px', color: tokens.accentText }}><span style={{ opacity: 0.7 }}>Currency: </span><strong>{currency}</strong></div>
                  </div>
                )}
              </div>

              <div style={{ background: tokens.bgCard, borderRadius: '18px', padding: '1.75rem', border: '1px solid ' + tokens.border, marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: tokens.text, marginBottom: '1.25rem' }}>{tr.basicInfo}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div><label style={lbl}>{tr.invoiceNum}</label><input style={inp} value={invoiceNum} onChange={e => { setInvoiceNum(e.target.value); setReady(false) }} /></div>
                  <div><label style={lbl}>{tr.currency}</label>
                    <select style={inp} value={currency} onChange={e => { setCurrency(e.target.value); setReady(false) }}>
                      <option value="USD">USD ($)</option><option value="JPY">JPY (¥)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <div><label style={lbl}>{tr.hourlyRate}</label><input style={inp} type="number" value={hourlyRate} onChange={e => { setHourlyRate(Number(e.target.value)); setReady(false) }} /></div>
                  <div><label style={lbl}>{tr.taxRate}</label><input style={inp} type="text" inputMode="decimal" value={taxRate === 0 ? '' : taxRate} onChange={e => { setTaxRate(e.target.value === '' ? 0 : Number(e.target.value)); setReady(false) }} placeholder="0" /></div>
                </div>
                <div style={{ height: '1px', background: tokens.border, margin: '1.25rem 0' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div><label style={lbl}>{tr.yourName}</label><input style={inp} value={fromName} onChange={e => { setFromName(e.target.value); setReady(false) }} placeholder={tr.namePlaceholder} /></div>
                  <div><label style={lbl}>{tr.yourEmail}</label><input style={inp} value={fromEmail} onChange={e => { setFromEmail(e.target.value); setReady(false) }} /></div>
                  <div><label style={lbl}>{tr.clientName}</label><input style={inp} value={toName} onChange={e => { setToName(e.target.value); setReady(false) }} placeholder={tr.clientPlaceholder} /></div>
                  <div><label style={lbl}>{tr.clientEmail}</label><input style={inp} value={toEmail} onChange={e => { setToEmail(e.target.value); setReady(false) }} /></div>
                </div>
              </div>

              <div style={{ background: tokens.bgCard, borderRadius: '18px', padding: '1.75rem', border: '1px solid ' + tokens.border }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: '600', color: tokens.text, margin: 0 }}>{tr.selectEntries}</h2>
                  <button onClick={selectAll}
                    style={{ fontSize: '13px', padding: '6px 14px', background: tokens.bgHover, border: 'none', borderRadius: '20px', cursor: 'pointer', color: tokens.textSecondary, fontWeight: '500', fontFamily: 'inherit' }}>
                    {tr.selectAll}
                  </button>
                </div>
                {entries.length === 0 ? (
                  <p style={{ color: tokens.textTertiary, fontSize: '14px', textAlign: 'center', padding: '2rem 0' }}>{tr.noEntries}</p>
                ) : entries.map(entry => (
                  <div key={entry.id} onClick={() => toggleSelect(entry.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '11px 14px', borderRadius: '12px', cursor: 'pointer', background: selected.includes(entry.id) ? tokens.bgActive : 'transparent', marginBottom: '4px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: '1.5px solid ' + (selected.includes(entry.id) ? tokens.accent : tokens.border), background: selected.includes(entry.id) ? tokens.accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {selected.includes(entry.id) && <span style={{ color: '#fff', fontSize: '12px', lineHeight: 1 }}>✓</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: tokens.text }}>{entry.description}</div>
                      <div style={{ fontSize: '12px', color: tokens.textTertiary, marginTop: '2px' }}>
                        {fmtDate(entry.started_at)} · {fmtH(entry.duration_seconds)}
                        {entry.client_id && clients.find(c => c.id === entry.client_id) && (
                          <span style={{ marginLeft: '8px', background: tokens.accentBg, color: tokens.accentText, padding: '1px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                            {clients.find(c => c.id === entry.client_id)?.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', color: tokens.text, fontWeight: '500' }}>
                      {symbol}{Math.round((entry.duration_seconds / 3600) * hourlyRate).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ position: 'sticky', top: '2rem' }}>
              <div style={{ background: tokens.bgCard, borderRadius: '18px', padding: '1.75rem', border: '1px solid ' + tokens.border, marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: tokens.text, marginBottom: '1.25rem' }}>{tr.totalSection}</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: tokens.textSecondary, marginBottom: '8px' }}>
                  <span>{tr.totalHours}</span><span style={{ color: tokens.text }}>{fmtH(totalSeconds)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: tokens.textSecondary, marginBottom: '8px' }}>
                  <span>{tr.subtotal}</span><span style={{ color: tokens.text }}>{symbol}{Math.round(subtotal).toLocaleString()}</span>
                </div>
                {taxRate > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: tokens.textSecondary, marginBottom: '8px' }}>
                    <span>{tr.tax} ({taxRate}%)</span><span style={{ color: tokens.text }}>{symbol}{Math.round(tax).toLocaleString()}</span>
                  </div>
                )}
                <div style={{ height: '1px', background: tokens.border, margin: '14px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '22px', fontWeight: '700', color: tokens.text }}>
                  <span style={{ fontSize: '15px', fontWeight: '500', color: tokens.textSecondary, alignSelf: 'center' }}>{tr.total}</span>
                  <span style={{ color: tokens.accent }}>{symbol}{Math.round(total).toLocaleString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(['en', 'ja', 'zh'] as Lang[]).length > 0 && (
                  <div style={{ background: tokens.bgCard, borderRadius: '14px', padding: '1rem 1.25rem', border: '1px solid ' + tokens.border }}>
                    <p style={{ fontSize: '11px', color: tokens.textTertiary, marginBottom: '8px', fontWeight: '600', letterSpacing: '0.05em' }}>PDF LANGUAGE</p>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {(['en', 'ja', 'zh'] as Lang[]).map(l => (
                        <button key={l} onClick={() => setLang(l)}
                          style={{ flex: 1, padding: '7px 0', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: 'inherit', background: lang === l ? tokens.accent : tokens.bgHover, color: lang === l ? '#fff' : tokens.textSecondary }}>
                          {l === 'en' ? 'EN' : l === 'ja' ? 'JA' : 'ZH'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={() => setReady(true)} disabled={selected.length === 0}
                  style={{ width: '100%', padding: '14px', background: selected.length === 0 ? tokens.textTertiary : tokens.text, color: tokens.bg, border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: selected.length === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                  {tr.preparePDF}
                </button>

                {ready && (
                  <PDFDownloadLink
                    document={<InvoicePDF invoiceNum={invoiceNum} fromName={fromName} fromEmail={fromEmail} toName={toName} toEmail={toEmail} entries={selectedEntries} hourlyRate={hourlyRate} currency={currency} taxRate={taxRate} lang={lang} />}
                    fileName={'invoice-' + invoiceNum + '.pdf'}
                    style={{ display: 'block', width: '100%', padding: '14px', background: tokens.accent, color: '#fff', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>
                    {({ loading }) => loading ? tr.generating : tr.downloadPDF}
                  </PDFDownloadLink>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
