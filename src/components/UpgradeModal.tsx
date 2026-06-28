'use client'
import { useTheme } from '@/contexts/ThemeContext'
import { useLang } from '@/contexts/LangContext'

type Props = {
  reason: 'clients' | 'invoices' | 'reminders'
  onClose: () => void
}

export default function UpgradeModal({ reason, onClose }: Props) {
  const { tokens } = useTheme()
  const { lang } = useLang()

  const messages = {
    clients: {
      en: { title: 'Client limit reached', desc: 'You\'ve reached the 5 client limit on the free plan. Upgrade to Pro for unlimited clients.' },
      ja: { title: 'クライアント数の上限に達しました', desc: '無料プランのクライアント数は5件までです。Proにアップグレードして無制限に追加しましょう。' },
      zh: { title: '已达到客户数量上限', desc: '免费版最多支持5个客户，升级Pro版即可无限添加。' },
    },
    invoices: {
      en: { title: 'Invoice limit reached', desc: 'You\'ve used all 10 invoices for this month. Upgrade to Pro for unlimited invoices.' },
      ja: { title: '請求書の上限に達しました', desc: '今月の請求書は10件までです。Proにアップグレードして無制限に作成しましょう。' },
      zh: { title: '已达到发票数量上限', desc: '本月已用完10张发票，升级Pro版即可无限生成。' },
    },
    reminders: {
      en: { title: 'Reminder limit reached', desc: 'You\'ve used all 5 AI reminders for this month. Upgrade to Pro for unlimited reminders.' },
      ja: { title: 'AI督促メールの上限に達しました', desc: '今月のAI督促メールは5回までです。Proにアップグレードして無制限に使いましょう。' },
      zh: { title: '已达到AI催款邮件上限', desc: '本月已用完5次AI催款邮件，升级Pro版即可无限使用。' },
    },
  }

  const msg = messages[reason][lang] || messages[reason]['en']

  const proFeatures = lang === 'ja'
    ? ['クライアント無制限', '請求書無制限', 'AI督促メール無制限', 'PDFロゴなし', '優先サポート']
    : lang === 'zh'
    ? ['无限客户', '无限发票', '无限AI催款', 'PDF无水印', '优先支持']
    : ['Unlimited clients', 'Unlimited invoices', 'Unlimited AI reminders', 'PDF without Flowly logo', 'Priority support']

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: tokens.bgCard, borderRadius: '20px', padding: '2rem', maxWidth: '420px', width: '100%', border: '1px solid ' + tokens.border, position: 'relative' }}>
        <button onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: tokens.textTertiary, fontFamily: 'inherit' }}>
          ×
        </button>

        <div style={{ width: '48px', height: '48px', background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '1rem' }}>
          ⚡
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: '700', color: tokens.text, marginBottom: '8px', letterSpacing: '-0.4px' }}>
          {msg.title}
        </h2>
        <p style={{ fontSize: '14px', color: tokens.textSecondary, lineHeight: '1.6', marginBottom: '1.5rem' }}>
          {msg.desc}
        </p>

        <div style={{ background: tokens.bgHover, borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '11px', color: tokens.textTertiary, fontWeight: '600', letterSpacing: '0.06em', marginBottom: '10px' }}>
            PRO — $7 / {lang === 'ja' ? '月' : lang === 'zh' ? '月' : 'month'}
          </div>
          {proFeatures.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: tokens.text, marginBottom: i < proFeatures.length - 1 ? '6px' : '0' }}>
              <span style={{ color: '#38BDF8', fontSize: '15px' }}>✓</span>{f}
            </div>
          ))}
        </div>

        <button
          onClick={() => { onClose(); window.location.href = '/pricing' }}
          style={{ width: '100%', padding: '13px', background: '#38BDF8', color: '#08080F', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '10px' }}>
          {lang === 'ja' ? 'Proにアップグレード' : lang === 'zh' ? '升级到Pro' : 'Upgrade to Pro'}
        </button>
        <button onClick={onClose}
          style={{ width: '100%', padding: '10px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', color: tokens.textTertiary, fontFamily: 'inherit' }}>
          {lang === 'ja' ? '後で' : lang === 'zh' ? '稍后再说' : 'Maybe later'}
        </button>
      </div>
    </div>
  )
}
