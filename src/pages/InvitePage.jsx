// src/pages/InvitePage.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Copy, Check, Link, Users, Mail } from 'lucide-react'

export default function InvitePage() {
  const { user, workspace, profile } = useAuth()
  const navigate = useNavigate()
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [members, setMembers] = useState([])
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (workspace) {
      // Generate invite link using workspace id as token
      const link = `${window.location.origin}/invite/${workspace.id}`
      setInviteLink(link)
      fetchMembers()
    }
  }, [workspace])

  async function fetchMembers() {
    // Fetch workspace owner profile as the only member for now
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, plan')
      .eq('id', workspace.owner_id)
    setMembers(data || [])
  }

  function copyLink() {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  async function sendInvite() {
    if (!email.trim()) return
    setSending(true)
    // Placeholder — wire to your email service when ready
    await new Promise(r => setTimeout(r, 800))
    setSent(true)
    setEmail('')
    setSending(false)
    setTimeout(() => setSent(false), 3000)
  }

  const inputStyle = {
    padding: '9px 12px', fontSize: 14,
    border: '1px solid var(--color-hairline)',
    borderRadius: 6, background: 'var(--color-surface)',
    color: 'var(--color-ink)', outline: 'none',
    width: '100%', boxSizing: 'border-box',
  }

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '40px 24px' }}>
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--color-ink-muted)', marginBottom: 28 }}>
        <ArrowLeft size={15} /> Back
      </button>

      <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, marginBottom: 6 }}>Invite members</h1>
      <p style={{ fontSize: 14, color: 'var(--color-ink-muted)', marginBottom: 32 }}>
        Share your workspace with your team.
      </p>

      {/* Invite link */}
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-lg)', padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#e6f7f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Link size={15} color="#2a9d99" />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Invite link</div>
            <div style={{ fontSize: 12, color: 'var(--color-ink-faint)' }}>Anyone with this link can join your workspace</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <input style={{ ...inputStyle, flex: 1, color: 'var(--color-ink-muted)', fontSize: 13 }}
            value={inviteLink} readOnly />
          <button onClick={copyLink} className="btn-primary" style={{ gap: 6, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy link</>}
          </button>
        </div>

        {copied && (
          <div style={{ marginTop: 12, fontSize: 13, color: '#166534', background: '#f0fff4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '8px 12px' }}>
            Link copied to clipboard!
          </div>
        )}
      </div>

      {/* Email invite */}
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-lg)', padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff0fb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mail size={15} color="#ff64c8" />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Invite by email</div>
            <div style={{ fontSize: 12, color: 'var(--color-ink-faint)' }}>Send an invite directly to someone's inbox</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <input style={{ ...inputStyle, flex: 1 }}
            placeholder="colleague@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendInvite()}
            type="email"
          />
          <button onClick={sendInvite} disabled={sending || !email.trim()} className="btn-primary"
            style={{ gap: 6, whiteSpace: 'nowrap', flexShrink: 0, opacity: !email.trim() ? 0.5 : 1 }}>
            {sending ? 'Sending…' : sent ? <><Check size={14} /> Sent!</> : 'Send invite'}
          </button>
        </div>

        {sent && (
          <div style={{ marginTop: 12, fontSize: 13, color: '#166534', background: '#f0fff4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '8px 12px' }}>
            Invite sent! (Email delivery coming soon via Resend)
          </div>
        )}
      </div>

      {/* Current members */}
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-hairline)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={15} color="var(--color-ink-muted)" />
          <h2 style={{ fontSize: 15, fontWeight: 600 }}>Members ({members.length})</h2>
        </div>
        {members.map((m, i) => (
          <div key={m.id} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
            borderBottom: i < members.length - 1 ? '1px solid var(--color-hairline)' : 'none',
          }}>
            <img
              src={m.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.full_name || 'U')}&size=36&background=0075de&color=fff`}
              alt="avatar"
              style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{m.full_name || 'Unknown'}</div>
              <div style={{ fontSize: 12, color: 'var(--color-ink-faint)' }}>{user?.email}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 'var(--rounded-full)', background: '#e8f4ff', color: '#0075de' }}>
                Owner
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Pro upsell */}
      {profile?.plan !== 'pro' && (
        <div style={{ marginTop: 20, padding: '16px 20px', background: '#fff8e6', border: '1px solid #fde68a', borderRadius: 'var(--rounded-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>Want unlimited members?</div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-muted)' }}>Upgrade to Pro to add unlimited team members.</div>
          </div>
          <button className="btn-primary" onClick={() => navigate('/app/upgrade')} style={{ whiteSpace: 'nowrap' }}>
            Upgrade to Pro
          </button>
        </div>
      )}
    </div>
  )
}
