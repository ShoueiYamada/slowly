import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { Lang, t } from '@/lib/i18n'

Font.register({
  family: 'NotoSans',
  fonts: [
    { src: '/fonts/NotoSansCJK-Regular.otf', fontWeight: 400 },
    { src: '/fonts/NotoSansCJK-Bold.otf', fontWeight: 700 },
  ],
})

const styles = StyleSheet.create({
  page: { padding: 56, fontFamily: 'NotoSans', fontSize: 10, color: '#1d1d1f', backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 48 },
  appName: { fontSize: 22, fontWeight: 700, color: '#1d1d1f', letterSpacing: -0.5 },
  metaLabel: { fontSize: 8, color: '#6e6e73', marginBottom: 2, fontWeight: 400 },
  metaValue: { fontSize: 10, color: '#1d1d1f', fontWeight: 400 },
  sectionLabel: { fontSize: 8, color: '#6e6e73', fontWeight: 400, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionBlock: { marginBottom: 32 },
  name: { fontSize: 12, fontWeight: 700, color: '#1d1d1f', marginBottom: 2 },
  sub: { fontSize: 10, color: '#6e6e73' },
  divider: { height: 0.5, backgroundColor: '#d2d2d7', marginBottom: 16, marginTop: 0 },
  tableHead: { flexDirection: 'row', paddingBottom: 8, marginBottom: 0 },
  tableHeadText: { fontSize: 8, color: '#6e6e73', fontWeight: 400, textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f5' },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: 'right' },
  totalSection: { marginTop: 24, alignItems: 'flex-end' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', width: 200, marginBottom: 6 },
  totalLabel: { fontSize: 10, color: '#6e6e73' },
  totalValue: { fontSize: 10, color: '#1d1d1f', fontWeight: 400 },
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', width: 200, marginTop: 8, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: '#d2d2d7' },
  grandLabel: { fontSize: 12, fontWeight: 700, color: '#1d1d1f' },
  grandValue: { fontSize: 14, fontWeight: 700, color: '#1d1d1f' },
  invoiceNumBadge: { fontSize: 10, color: '#6e6e73', marginBottom: 8 },
})

type Entry = { description: string; duration_seconds: number }

export default function InvoicePDF({
  invoiceNum, fromName, fromEmail, toName, toEmail,
  entries, hourlyRate, currency, taxRate, lang
}: {
  invoiceNum: string, fromName: string, fromEmail: string,
  toName: string, toEmail: string, entries: Entry[],
  hourlyRate: number, currency: string, taxRate: number, lang: Lang
}) {
  const tr = t[lang]
  const symbol = currency === 'JPY' ? '¥' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'
  const totalSeconds = entries.reduce((s, e) => s + e.duration_seconds, 0)
  const totalHours = totalSeconds / 3600
  const subtotal = totalHours * hourlyRate
  const tax = subtotal * (taxRate / 100)
  const total = subtotal + tax
  const today = new Date()
  const due = new Date(today); due.setDate(due.getDate() + 14)
  const fmtDate = (d: Date) => `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
  const fmtH = (s: number) => { const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); return `${h}h ${String(m).padStart(2, '0')}m` }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>{tr.appName}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.invoiceNumBadge}>{tr.invoice} #{invoiceNum}</Text>
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.metaLabel}>{tr.issued}</Text>
              <Text style={styles.metaValue}>{fmtDate(today)}</Text>
            </View>
            <View>
              <Text style={styles.metaLabel}>{tr.due}</Text>
              <Text style={styles.metaValue}>{fmtDate(due)}</Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 }}>
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>{tr.from}</Text>
            <Text style={styles.name}>{fromName || '—'}</Text>
            <Text style={styles.sub}>{fromEmail}</Text>
          </View>
          <View style={[styles.sectionBlock, { alignItems: 'flex-end' }]}>
            <Text style={styles.sectionLabel}>{tr.billTo}</Text>
            <Text style={styles.name}>{toName || '—'}</Text>
            <Text style={styles.sub}>{toEmail}</Text>
          </View>
        </View>

        <View style={styles.divider} />
        <View style={styles.tableHead}>
          <Text style={[styles.tableHeadText, styles.col1]}>{tr.description}</Text>
          <Text style={[styles.tableHeadText, styles.col2]}>{tr.hours}</Text>
          <Text style={[styles.tableHeadText, styles.col2]}>{tr.amount}</Text>
        </View>
        <View style={styles.divider} />

        {entries.map((e, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={[styles.col1, { fontSize: 10 }]}>{e.description}</Text>
            <Text style={[styles.col2, { fontSize: 10 }]}>{fmtH(e.duration_seconds)}</Text>
            <Text style={[styles.col2, { fontSize: 10 }]}>{symbol}{Math.round((e.duration_seconds / 3600) * hourlyRate).toLocaleString()}</Text>
          </View>
        ))}

        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{tr.subtotal}</Text>
            <Text style={styles.totalValue}>{symbol}{Math.round(subtotal).toLocaleString()}</Text>
          </View>
          {taxRate > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{tr.tax} ({taxRate}%)</Text>
              <Text style={styles.totalValue}>{symbol}{Math.round(tax).toLocaleString()}</Text>
            </View>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandLabel}>{tr.total}</Text>
            <Text style={styles.grandValue}>{symbol}{Math.round(total).toLocaleString()}</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
