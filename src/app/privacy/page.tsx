'use client'
export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#060a0f', color: '#eef2ff', fontFamily: '-apple-system, BlinkMacSystemFont, Inter, sans-serif', padding: '4rem 2rem' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '2rem', letterSpacing: '-1px' }}>Privacy Policy</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem', fontSize: '14px' }}>Last updated: June 2026</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', fontSize: '15px', lineHeight: '1.7', color: 'rgba(255,255,255,0.7)' }}>
          <section>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '0.75rem' }}>1. Information We Collect</h2>
            <p>We collect information you provide directly: email address, name, client information, time entries, and invoice data. We use Supabase for authentication and database storage, and Stripe for payment processing.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '0.75rem' }}>2. How We Use Your Information</h2>
            <p>We use your information to provide the Flowly service, process payments, generate invoices and reports, and send AI-generated payment reminder emails on your request. We do not sell your data to third parties.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '0.75rem' }}>3. Data Storage</h2>
            <p>Your data is stored securely with Supabase (PostgreSQL) with row-level security policies. Payment information is handled entirely by Stripe; we never store your card details.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '0.75rem' }}>4. Third-Party Services</h2>
            <p>We use Anthropic's Claude API to generate payment reminder email drafts. We use exchange rate data from open.er-api.com. We do not share your personal client data with these services beyond what's necessary to generate content.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '0.75rem' }}>5. Your Rights</h2>
            <p>You can request deletion of your account and all associated data at any time by contacting us. You can export your data via the Tax Report feature.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '0.75rem' }}>6. Contact</h2>
            <p>For privacy questions, contact us at the email listed in your account settings or via our support channels.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
