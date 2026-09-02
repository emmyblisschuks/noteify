// src/pages/UpgradePage.jsx
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Check, ArrowLeft, Zap } from 'lucide-react'

const FREE_FEATURES = [
  'Unlimited pages',
  '10 MB file uploads',
  'Basic CRM',
  '7-day page history',
  'Share via link',
]

const PRO_FEATURES = [
  'Everything in Free',
  'Unlimited file uploads',
  'Advanced CRM + Pipeline',
  'Unlimited page history',
  'REST API access',
  'Webhook integrations',
  'Priority support',
]

export default function UpgradePage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const isPro = profile?.plan === 'pro'

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--color-ink-muted)', marginBottom: 20 }}>
          <ArrowLeft size={15} /> Back
        </button>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff1e6', color: '#dd5b00', borderRadius: 'var(--rounded-full)', padding: '4px 12px', fontSize: 12, fontWeight: 600, marginBottom: 14 }}>
          <Zap size={12} /> Upgrade to Pro
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5, marginBottom: 8 }}>Simple, honest pricing</h1>
        <p style={{ fontSize: 15, color: 'var(--color-ink-muted)' }}>Unlock everything Noteify has to offer.</p>
      </div>

      {/* Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 40 }}>
        {/* Free */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-lg)', padding: 28 }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Free</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
            <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1 }}>₦0</span>
            <span style={{ color: 'var(--color-ink-muted)', fontSize: 14 }}>/month</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-ink-muted)', marginBottom: 22 }}>Perfect for personal use and getting started.</p>
          <ul style={{ listStyle: 'none', marginBottom: 26, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FREE_FEATURES.map(f => (
              <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, color: 'var(--color-ink-secondary)' }}>
                <Check size={14} color="#1aae39" strokeWidth={2.5} /> {f}
              </li>
            ))}
          </ul>
          <button className="btn-utility" style={{ width: '100%', justifyContent: 'center', opacity: 0.6, cursor: 'default' }}>
            {isPro ? 'Downgrade' : 'Current plan'}
          </button>
        </div>

        {/* Pro */}
        <div style={{ background: 'var(--color-surface)', border: '2px solid var(--color-primary)', borderRadius: 'var(--rounded-lg)', padding: 28, position: 'relative' }}>
          <span style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'var(--color-primary)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 12px', borderRadius: 'var(--rounded-full)', whiteSpace: 'nowrap' }}>
            Recommended
          </span>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Pro</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
            <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1 }}>₦5,000</span>
            <span style={{ color: 'var(--color-ink-muted)', fontSize: 14 }}>/month</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-ink-muted)', marginBottom: 22 }}>For teams and power users who need more.</p>
          <ul style={{ listStyle: 'none', marginBottom: 26, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PRO_FEATURES.map(f => (
              <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, color: 'var(--color-ink-secondary)' }}>
                <Check size={14} color="#0075de" strokeWidth={2.5} /> {f}
              </li>
            ))}
          </ul>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', gap: 6 }}
            onClick={() => alert('Payment coming soon! We\'ll notify you when Paystack is ready.')}>
            <Zap size={15} /> {isPro ? 'Current plan' : 'Upgrade to Pro'}
          </button>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ background: 'var(--color-canvas-soft)', borderRadius: 'var(--rounded-lg)', padding: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Common questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            { q: 'Can I cancel anytime?', a: 'Yes. Cancel anytime and keep Pro access until the end of your billing period.' },
            { q: 'Is my data safe on the free plan?', a: 'Absolutely. All plans get the same security and data protection.' },
            { q: 'How do I pay?', a: 'We support Paystack and bank transfer. Payment gateway coming very soon.' },
          ].map(({ q, a }) => (
            <div key={q}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{q}</div>
              <div style={{ fontSize: 14, color: 'var(--color-ink-muted)', lineHeight: 1.6 }}>{a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
