// src/pages/SettingsPage.jsx
import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Camera, Check, Lock, User, Building2, CreditCard, AlertCircle } from 'lucide-react'

const sectionStyle = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-hairline)',
  borderRadius: 12,
  overflow: 'hidden',
  marginBottom: 20,
}

const sectionHeaderStyle = {
  padding: '16px 20px',
  borderBottom: '1px solid var(--color-hairline)',
  background: 'var(--color-canvas-soft)',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}

const labelStyle = {
  fontSize: 13, fontWeight: 500,
  color: 'var(--color-ink-muted)',
  display: 'block', marginBottom: 6,
}

const inputStyle = {
  width: '100%', padding: '9px 12px', fontSize: 14,
  border: '1px solid var(--color-hairline)',
  borderRadius: 6, background: 'var(--color-surface)',
  color: 'var(--color-ink)', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.15s',
}

export default function SettingsPage() {
  const { user, profile, workspace, fetchProfile } = useAuth()

  // Profile state
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const avatarRef = useRef(null)

  // Workspace state
  const [workspaceName, setWorkspaceName] = useState(workspace?.name || '')
  const [workspaceSaving, setWorkspaceSaving] = useState(false)
  const [workspaceSaved, setWorkspaceSaved] = useState(false)

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState(null)

  // Feedback helper
  function showSaved(setter) {
    setter(true)
    setTimeout(() => setter(false), 2500)
  }

  // Upload avatar
  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `avatars/${user.id}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const url = data.publicUrl
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
      setAvatarUrl(url)
      await fetchProfile(user.id)
    } catch (err) {
      console.error(err)
    } finally {
      setAvatarUploading(false)
    }
  }

  // Save profile
  async function saveProfile() {
    if (!fullName.trim()) return
    setProfileSaving(true)
    await supabase.from('profiles').update({ full_name: fullName.trim() }).eq('id', user.id)
    await fetchProfile(user.id)
    setProfileSaving(false)
    showSaved(setProfileSaved)
  }

  // Save workspace
  async function saveWorkspace() {
    if (!workspaceName.trim() || !workspace) return
    setWorkspaceSaving(true)
    await supabase.from('workspaces').update({ name: workspaceName.trim() }).eq('id', workspace.id)
    await fetchProfile(user.id)
    setWorkspaceSaving(false)
    showSaved(setWorkspaceSaved)
  }

  // Change password
  async function changePassword() {
    setPasswordMsg(null)
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match.' })
      return
    }
    setPasswordSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setPasswordMsg({ type: 'error', text: error.message })
    } else {
      setPasswordMsg({ type: 'success', text: 'Password updated successfully!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
    setPasswordSaving(false)
  }

  const saveBtn = (onClick, saving, saved, label = 'Save changes') => (
    <button onClick={onClick} disabled={saving} style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '8px 18px', fontSize: 13, fontWeight: 500,
      background: saved ? '#1aae39' : 'var(--color-primary)',
      color: '#fff', border: 'none', borderRadius: 9999,
      cursor: saving ? 'not-allowed' : 'pointer',
      opacity: saving ? 0.7 : 1, transition: 'background 0.2s',
    }}>
      {saved ? <><Check size={13} /> Saved</> : saving ? 'Saving…' : label}
    </button>
  )

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 14, color: 'var(--color-ink-muted)' }}>Manage your profile, workspace and account.</p>
      </div>

      {/* PROFILE */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <User size={15} color="var(--color-ink-muted)" />
          <span style={{ fontSize: 14, fontWeight: 600 }}>Profile</span>
        </div>
        <div style={{ padding: '20px' }}>
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ position: 'relative' }}>
              <img
                src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'U')}&size=64&background=0075de&color=fff`}
                alt="avatar"
                style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-hairline)' }}
              />
              <button
                onClick={() => avatarRef.current?.click()}
                disabled={avatarUploading}
                style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'var(--color-primary)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--color-surface)', cursor: 'pointer',
                }}>
                <Camera size={11} />
              </button>
              <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{profile?.full_name || 'Your name'}</div>
              <div style={{ fontSize: 12, color: 'var(--color-ink-faint)', marginBottom: 8 }}>{user?.email}</div>
              <button onClick={() => avatarRef.current?.click()} disabled={avatarUploading}
                style={{ fontSize: 12, padding: '4px 12px', borderRadius: 9999, border: '1px solid var(--color-hairline)', background: 'var(--color-canvas-soft)', cursor: 'pointer', color: 'var(--color-ink-muted)' }}>
                {avatarUploading ? 'Uploading…' : 'Change photo'}
              </button>
            </div>
          </div>

          {/* Full name */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Full name</label>
            <input
              style={inputStyle}
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your full name"
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-hairline)'}
            />
          </div>

          {/* Email — read only */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Email address</label>
            <input
              style={{ ...inputStyle, background: 'var(--color-canvas-soft)', color: 'var(--color-ink-muted)', cursor: 'not-allowed' }}
              value={user?.email || ''}
              readOnly
            />
            <p style={{ fontSize: 12, color: 'var(--color-ink-faint)', marginTop: 5 }}>Email cannot be changed here.</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {saveBtn(saveProfile, profileSaving, profileSaved)}
          </div>
        </div>
      </div>

      {/* WORKSPACE */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <Building2 size={15} color="var(--color-ink-muted)" />
          <span style={{ fontSize: 14, fontWeight: 600 }}>Workspace</span>
        </div>
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Workspace name</label>
            <input
              style={inputStyle}
              value={workspaceName}
              onChange={e => setWorkspaceName(e.target.value)}
              placeholder="My Workspace"
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-hairline)'}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {saveBtn(saveWorkspace, workspaceSaving, workspaceSaved)}
          </div>
        </div>
      </div>

      {/* PASSWORD */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <Lock size={15} color="var(--color-ink-muted)" />
          <span style={{ fontSize: 14, fontWeight: 600 }}>Change password</span>
        </div>
        <div style={{ padding: '20px' }}>
          {/* Only show if signed in with email, not Google */}
          {user?.app_metadata?.provider === 'google' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', background: '#eff6ff', borderRadius: 8, fontSize: 13, color: '#0075de' }}>
              <AlertCircle size={15} />
              You signed in with Google. Password change is not available.
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>New password</label>
                <input
                  type="password"
                  style={inputStyle}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-hairline)'}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Confirm new password</label>
                <input
                  type="password"
                  style={inputStyle}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-hairline)'}
                />
              </div>

              {passwordMsg && (
                <div style={{
                  marginBottom: 14, padding: '10px 14px', borderRadius: 8, fontSize: 13,
                  background: passwordMsg.type === 'error' ? '#fef2f2' : '#f0fdf4',
                  color: passwordMsg.type === 'error' ? '#c0392b' : '#166534',
                  border: `1px solid ${passwordMsg.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
                }}>
                  {passwordMsg.text}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {saveBtn(changePassword, passwordSaving, false, 'Update password')}
              </div>
            </>
          )}
        </div>
      </div>

      {/* PLAN */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <CreditCard size={15} color="var(--color-ink-muted)" />
          <span style={{ fontSize: 14, fontWeight: 600 }}>Plan</span>
        </div>
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>{profile?.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}</span>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999,
                  background: profile?.plan === 'pro' ? '#e8f4ff' : 'var(--color-canvas-soft)',
                  color: profile?.plan === 'pro' ? '#0075de' : 'var(--color-ink-faint)',
                }}>
                  {profile?.plan === 'pro' ? 'Active' : 'Free'}
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--color-ink-muted)' }}>
                {profile?.plan === 'pro'
                  ? 'You have full access to all Pro features.'
                  : 'Upgrade to Pro for unlimited uploads, API access and more.'}
              </p>
            </div>
            {profile?.plan !== 'pro' && (
              <button style={{
                padding: '9px 20px', fontSize: 14, fontWeight: 500,
                background: 'var(--color-primary)', color: '#fff',
                border: 'none', borderRadius: 9999, cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}>
                Upgrade to Pro
              </button>
            )}
          </div>

          {/* Feature comparison */}
          <div style={{ marginTop: 20, borderTop: '1px solid var(--color-hairline)', paddingTop: 16 }}>
            {[
              { label: 'Unlimited pages', free: true, pro: true },
              { label: 'API access', free: false, pro: true },
              { label: 'Unlimited file uploads', free: false, pro: true },
              { label: 'Advanced CRM pipeline', free: false, pro: true },
              { label: 'Priority support', free: false, pro: true },
            ].map(f => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--color-hairline)' }}>
                <span style={{ fontSize: 13, color: 'var(--color-ink-secondary)' }}>{f.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: (profile?.plan === 'pro' ? f.pro : f.free) ? '#1aae39' : 'var(--color-ink-faint)' }}>
                  {(profile?.plan === 'pro' ? f.pro : f.free) ? '✓' : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
