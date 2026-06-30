'use client'
export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#060a0f', color: '#eef2ff', fontFamily: '-apple-system, BlinkMacSystemFont, Inter, sans-serif', padding: '4rem 2rem' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '2rem', letterSpacing: '-1px' }}>Terms of Service</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem', fontSize: '14px' }}>Last updated: June 2026</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', fontSize: '15px', lineHeight: '1.7', color: 'rgba(255,255,255,0.7)' }}>
          <section>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '0.75rem' }}>1. Acceptance of Terms</h2>
            <p>By using Flowly, you agree to these Terms of Service. If you do not agree, please do not use the service.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '0.75rem' }}>2. Service Description</h2>
            <p>Flowly is a time tracking, invoicing, and financial reporting tool for freelancers. We offer a Free plan with usage limits and a Pro plan ($19/month) with unlimited usage and additional features.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '0.75rem' }}>3. Subscription & Billing</h2>
            <p>Pro plan subscriptions are billed monthly via Stripe. You can cancel anytime from the Pricing page. No refunds are provided for partial billing periods.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '0.75rem' }}>4. Tax & Financial Disclaimer</h2>
            <p>Flowly provides tools to help organize financial data for tax filing purposes, but is not a substitute for professional tax or legal advice. Exchange rates shown are for reference only and may differ from official rates used by tax authorities. Always consult a licensed accountant for tax filing.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '0.75rem' }}>5. AI-Generated Content</h2>
            <p>AI-generated payment reminder emails are drafts. You are responsible for reviewing content before sending to clients.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '0.75rem' }}>6. Limitation of Liability</h2>
            <p>Flowly is provided "as is" without warranties. We are not liable for any financial losses, tax penalties, or business decisions made based on data from this service.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '0.75rem' }}>7. Contact</h2>
            <p>For questions about these terms, contact us via the support information in your account settings.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
