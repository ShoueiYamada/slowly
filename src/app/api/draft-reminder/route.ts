import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { clientName, invoiceNum, amount, currency, daysOverdue, tone, lang, fromName, fromEmail } = await req.json()

    const symbol = currency === 'JPY' ? '¥' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'
    const toneDesc = tone === 'soft'
      ? (lang === 'ja' ? '丁寧でやわらかい' : 'polite and gentle')
      : tone === 'firm'
      ? (lang === 'ja' ? '丁寧だが毅然とした' : 'polite but firm')
      : (lang === 'ja' ? '最終警告として強め' : 'strong final warning')

    // Always write in English — clients are overseas
    const langInstruction = 'Write in English. Do not use Japanese.'

    const prompt = `You are a professional freelancer writing a payment reminder email.
${langInstruction}
Tone: ${toneDesc}

Details:
- Client name: ${clientName}
- Invoice number: ${invoiceNum}
- Amount due: ${symbol}${amount}
- Days overdue: ${daysOverdue} days
- Sender name: ${fromName || 'the sender'}
- Sender email: ${fromEmail || ''}

Write a complete payment reminder email with subject line and body.
Format:
Subject: [subject here]

[email body here]

Important: Sign the email with the actual sender name "${fromName || 'the sender'}" and email "${fromEmail || ''}". Do NOT use placeholders like [Your Name].`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const subjectMatch = text.match(/Subject:\s*(.+)/i)
    const subject = subjectMatch ? subjectMatch[1].trim() : 'Payment Reminder'
    const body = text.replace(/Subject:\s*.+\n?/i, '').trim()

    return NextResponse.json({ subject, body })
  } catch (error: any) {
    console.error('API Error:', error?.message || error)
    return NextResponse.json({ error: error?.message || 'Unknown error' }, { status: 500 })
  }
}
