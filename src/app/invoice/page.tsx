'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Lang, t } from '@/lib/i18n'

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(m => m.PDFDownloadLink),
  { ssr: false }
)
import InvoicePDF from '@/components/InvoicePDF'

type Entry = { id: string; description: string; duration_seconds: number; started_at: string }

export default function InvoicePage() {
  const [user, setUser] = useState<any>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [lang, setLang] = useState<Lang>('en')
  const [fromName, setFromName] = useState('')
  const [fromEmail, setFromEmail] = useState('')
  const [toName, setToName] = useState('')
  const [toEmail, setToEmail] = useState('')
  const [hourlyRate, setHourlyRate] = useState(75)
  const [currency, setCurrency] = useState('USD')
  const [taxRate, setTaxRate] = useState(0)
  const [invoiceNum, setInvoiceNum] = useState('0001')
  const [ready, setReady] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const tr = t[lang]

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
      else { setUser(user); setFromEmail(user.email || ''); loadEntries(user.id) }
    })
  }, [])

  async function loadEntries(uid: string) {
    const { data } = await supabase.from('time_entries').select('*').eq('user_id', uid).order('started_at', { ascending: false })
    if (data) setEntries(data)
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

  const input = { width: '100%', padding: '10px 14px', border: '1px solid #d2d2d7', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' as const, color: '#1d1d1f', outline: 'none', background: '#fff' }
  const label = { display: 'block' as const, fontSize: '12px', color: '#6e6e73', marginBottom: '6px', fontWeight: '500' as const }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
      <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderBottom: '0.5px solid #d2d2d7', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '52px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => router.push('/dashboard')}
              style={{ background: 'none', border: 'none', color: '#0071e3', cursor: 'pointer', fontSize: '14px', padding: 0 }}>
              {tr.back}
            </button>
            <span style={{ color: '#d2d2d7' }}>|</span>
            <span style={{ fontSize: '15px', fontWeight: '600', color: '#1d1d1f' }}>{tr.createInvoice}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['en', 'ja', 'zh'] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)}
                style={{ padding: '4px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '500', background: lang === l ? '#1d1d1f' : '#e8e8ed', color: lang === l ? '#fff' : '#6e6e73' }}>
                {l === 'en' ? 'EN' : l === 'ja' ? '日本語' : '中文'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
        <div>
          <div style={{ background: '#fff', borderRadius: '18px', padding: '2rem', marginBottom: '1.5rem', border: '0.5px solid #d2d2d7' }}>
            <h2 style={{ fontSize: '17px', fontWeight: '600', color: '#1d1d1f', marginBottom: '1.25rem' }}>{tr.basicInfo}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div><label style={label}>{tr.invoiceNum}</label><input style={input} value={invoiceNum} onChange={e => { setInvoiceNum(e.target.value); setReady(false) }} /></div>
              <div><label style={label}>{tr.currency}</label>
                <select style={input} value={currency} onChange={e => { setCurrency(e.target.value); setReady(false) }}>
                  <option value="USD">USD ($)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div><label style={label}>{tr.hourlyRate}</label><input style={input} type="number" value={hourlyRate} onChange={e => { setHourlyRate(Number(e.target.value)); setReady(false) }} /></div>
              <div><label style={label}>{tr.taxRate}</label><input style={input} type="number" value={taxRate} onChange={e => { setTaxRate(Number(e.target.value)); setReady(false) }} /></div>
            </div>
            <div style={{ height: '0.5px', background: '#f0f0f5', margin: '1.25rem 0' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div><label style={label}>{tr.yourName}</label><input style={input} value={fromName} onChange={e => { setFromName(e.target.value); setReady(false) }} placeholder={tr.namePlaceholder} /></div>
              <div><label style={label}>{tr.yourEmail}</label><input style={input} value={fromEmail} onChange={e => { setFromEmail(e.target.value); setReady(false) }} /></div>
              <div><label style={label}>{tr.clientName}</label><input style={input} value={toName} onChange={e => { setToName(e.target.value); setReady(false) }} placeholder={tr.clientPlaceholder} /></div>
              <div><label style={label}>{tr.clientEmail}</label><input style={input} value={toEmail} onChange={e => { setToEmail(e.target.value); setReady(false) }} /></div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '18px', padding: '2rem', border: '0.5px solid #d2d2d7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '17px', fontWeight: '600', color: '#1d1d1f', margin: 0 }}>{tr.selectEntries}</h2>
              <button onClick={selectAll}
                style={{ fontSize: '13px', padding: '6px 14px', background: '#f5f5f7', border: 'none', borderRadius: '20px', cursor: 'pointer', color: '#1d1d1f', fontWeight: '500' }}>
                {tr.selectAll}
              </button>
            </div>
            {entries.length === 0 ? (
              <p style={{ color: '#6e6e73', fontSize: '14px', textAlign: 'center', padding: '2rem 0' }}>{tr.noEntries}</p>
            ) : entries.map(entry => (
              <div key={entry.id} onClick={() => toggleSelect(entry.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px', borderRadius: '12px', cursor: 'pointer', background: selected.includes(entry.id) ? '#f0f7ff' : 'transparent', marginBottom: '4px', transition: 'background 0.15s' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: `1.5px solid ${selected.includes(entry.id) ? '#0071e3' : '#d2d2d7'}`, background: selected.includes(entry.id) ? '#0071e3' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {selected.includes(entry.id) && <span style={{ color: '#fff', fontSize: '13px', lineHeight: 1 }}>✓</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#1d1d1f' }}>{entry.description}</div>
                  <div style={{ fontSize: '12px', color: '#6e6e73', marginTop: '2px' }}>{fmtDate(entry.started_at)} · {fmtH(entry.duration_seconds)}</div>
                </div>
                <div style={{ fontSize: '14px', color: '#1d1d1f', fontWeight: '500' }}>{symbol}{Math.round((entry.duration_seconds / 3600) * hourlyRate).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'sticky', top: '68px' }}>
          <div style={{ background: '#fff', borderRadius: '18px', padding: '1.75rem', border: '0.5px solid #d2d2d7', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '17px', fontWeight: '600', color: '#1d1d1f', marginBottom: '1.25rem' }}>{tr.totalSection}</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6e6e73', marginBottom: '8px' }}>
              <span>{tr.totalHours}</span><span style={{ color: '#1d1d1f' }}>{fmtH(totalSeconds)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6e6e73', marginBottom: '8px' }}>
              <span>{tr.subtotal}</span><span style={{ color: '#1d1d1f' }}>{symbol}{Math.round(subtotal).toLocaleString()}</span>
            </div>
            {taxRate > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6e6e73', marginBottom: '8px' }}>
                <span>{tr.tax} ({taxRate}%)</span><span style={{ color: '#1d1d1f' }}>{symbol}{Math.round(tax).toLocaleString()}</span>
              </div>
            )}
            <div style={{ height: '0.5px', background: '#d2d2d7', margin: '14px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '700', color: '#1d1d1f' }}>
              <span>{tr.total}</span><span>{symbol}{Math.round(total).toLocaleString()}</span>
            </div>
          </div>

          <button onClick={() => setReady(true)} disabled={selected.length === 0}
            style={{ width: '100%', padding: '14px', background: selected.length === 0 ? '#d2d2d7' : '#1d1d1f', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: selected.length === 0 ? 'not-allowed' : 'pointer', marginBottom: '10px' }}>
            {tr.preparePDF}
          </button>
          {ready && (
            <PDFDownloadLink
              document={<InvoicePDF invoiceNum={invoiceNum} fromName={fromName} fromEmail={fromEmail} toName={toName} toEmail={toEmail} entries={selectedEntries} hourlyRate={hourlyRate} currency={currency} taxRate={taxRate} lang={lang} />}
              fileName={`invoice-${invoiceNum}.pdf`}
              style={{ display: 'block', width: '100%', padding: '14px', background: '#0071e3', color: '#fff', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>
              {({ loading }) => loading ? tr.generating : tr.downloadPDF}
            </PDFDownloadLink>
          )}
        </div>
      </div>
    </div>
  )
}
