// src/pages/SettingsPage.jsx
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Check, Camera } from 'lucide-react'

export default function SettingsPage() {
  const { user, profile, workspace, fetchProfile } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [workspaceName, setWorkspaceName] = useState(workspace?.name || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const inputStyle = {
    padding: '9px 12px', fontSize: 14,
    border: '1px solid var(--color-hairline)',
    borderRadius: 6, background: 'var(--color-surface)',
    color: 'var(--color-ink)', outline: 'none',
    width: '100%', boxSizing: 'border-box',
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      if (fullName.trim() !== profile?.full_name) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ full_name: fullName.trim() })
          .eq('id', user.id)
        if (profileError) throw profileError
      }

      if (workspaceName.trim() !== workspace?.name) {
        const { error: wsError } = await supabase
          .from('workspaces')
          .update({ name: workspaceName.trim() })
          .eq('id', workspace.id)
        if (wsError) throw wsError
      }

      await fetchProfile(user.id)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      setError(e.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '40px 24px' }}>
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--color-ink-muted)', marginBottom: 28 }}>
        <ArrowLeft size={15} /> Back
      </button>

      <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, marginBottom: 32 }}>Settings</h1>

      {/* Profile section */}
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-lg)', padding: 24, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Profile</h2>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ position: 'relative' }}>
            <img
              src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'U')}&size=64&background=0075de&color=fff`}
              alt="avatar"
              style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid var(--color-hairline)' }}
            />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid var(--color-surface)' }}>
              <Camera size={11} color="#fff" />
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{profile?.full_name || 'No name set'}</div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-faint)' }}>{user?.email}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink-muted)', display: 'block', marginBottom: 6 }}>Full name</label>
            <input style={inputStyle} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink-muted)', display: 'block', marginBottom: 6 }}>Email</label>
            <input style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} value={user?.email || ''} disabled />
            <div style={{ fontSize: 12, color: 'var(--color-ink-faint)', marginTop: 4 }}>Email cannot be changed.</div>
          </div>
        </div>
      </div>

      {/* Workspace section */}
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-lg)', padding: 24, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Workspace</h2>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink-muted)', display: 'block', marginBottom: 6 }}>Workspace name</label>
          <input style={inputStyle} value={workspaceName} onChange={e => setWorkspaceName(e.target.value)} placeholder="My Workspace" />
        </div>
      </div>

      {/* Plan section */}
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-lg)', padding: 24, marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Plan</h2>
            <div style={{ fontSize: 14, color: 'var(--color-ink-muted)' }}>
              You are on the <strong>{profile?.plan === 'pro' ? 'Pro' : 'Free'}</strong> plan.
            </div>
          </div>
          {profile?.plan !== 'pro' && (
            <button className="btn-primary" style={{ gap: 6, whiteSpace: 'nowrap' }} onClick={() => navigate('/app/upgrade')}>
              Upgrade to Pro
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 14, color: '#c0392b', marginBottom: 16 }}>
          {error}
        </div>
      )}

      <button className="btn-primary" onClick={handleSave} disabled={saving}
        style={{ gap: 8, minWidth: 120, justifyContent: 'center' }}>
        {saved ? <><Check size={15} /> Saved</> : saving ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  )
}
