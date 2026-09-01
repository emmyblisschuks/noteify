// src/pages/LoginPage.jsx
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Sun, Moon, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const { signInWithGoogle, user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user) navigate('/app')
  }, [user])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess('Check your email for a confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/app')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    fontSize: 15,
    color: 'var(--color-ink)',
    background: 'var(--color-surface)',
    border: '1px solid rgb(221,221,221)',
    borderRadius: 4, // rounded.xs per design spec
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'box-shadow 0.15s',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-canvas-soft)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      {/* Theme toggle */}
      <button onClick={toggleTheme} style={{
        position: 'fixed', top: 20, right: 20,
        padding: 8, borderRadius: 'var(--rounded-md)',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-hairline)',
        color: 'var(--color-ink-muted)', display: 'flex'
      }}>
        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
      </button>

      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-hairline)',
        borderRadius: 16,
        padding: '48px 44px',
        width: '100%',
        maxWidth: 400,
        boxShadow: 'var(--shadow-elevated)',
        textAlign: 'center',
        boxSizing: 'border-box',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            width: 44, height: 44,
            borderRadius: 'var(--rounded-md)',
            background: 'var(--color-primary)',
            margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, marginBottom: 6 }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-ink-muted)', lineHeight: 1.6 }}>
            {mode === 'login'
              ? 'Sign in to continue to Noteify'
              : 'Start for free — no credit card required'}
          </p>
        </div>

        {/* Mode toggle tabs */}
        <div style={{
          display: 'flex',
          background: 'var(--color-canvas-soft)',
          borderRadius: 8,
          padding: 4,
          marginBottom: 24,
          gap: 4,
        }}>
          {['login', 'signup'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }}
              style={{
                flex: 1, padding: '7px 0', fontSize: 14, fontWeight: 500,
                borderRadius: 6,
                background: mode === m ? 'var(--color-surface)' : 'transparent',
                color: mode === m ? 'var(--color-ink)' : 'var(--color-ink-muted)',
                border: mode === m ? '1px solid var(--color-hairline)' : '1px solid transparent',
                cursor: 'pointer',
                boxShadow: mode === m ? 'var(--shadow-soft)' : 'none',
                transition: 'all 0.15s',
              }}>
              {m === 'login' ? 'Log in' : 'Sign up'}
            </button>
          ))}
        </div>

        {/* Email/password form */}
        <form onSubmit={handleSubmit} style={{ textAlign: 'left', marginBottom: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink-muted)', display: 'block', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.boxShadow = '0 0 0 2px var(--color-primary)'}
              onBlur={e => e.target.style.boxShadow = 'none'}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink-muted)', display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ ...inputStyle, paddingRight: 40 }}
                onFocus={e => e.target.style.boxShadow = '0 0 0 2px var(--color-primary)'}
                onBlur={e => e.target.style.boxShadow = 'none'}
              />
              <button type="button" onClick={() => setShowPassword(s => !s)}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-ink-muted)', display: 'flex', padding: 0,
                }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error / success messages */}
          {error && (
            <div style={{
              marginBottom: 14, padding: '10px 12px', borderRadius: 6,
              background: '#fff0f0', border: '1px solid #ffd0d0',
              fontSize: 13, color: '#cc0000', textAlign: 'left',
            }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{
              marginBottom: 14, padding: '10px 12px', borderRadius: 6,
              background: '#f0fff4', border: '1px solid #bbf7d0',
              fontSize: 13, color: '#166534', textAlign: 'left',
            }}>
              {success}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '11px 20px',
            background: loading ? 'var(--color-ink-faint)' : 'var(--color-primary)',
            color: '#fff', border: 'none',
            borderRadius: 9999, // pill — button-primary spec
            fontSize: 15, fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
          }}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--color-hairline)' }} />
          <span style={{ fontSize: 12, color: 'var(--color-ink-faint)', whiteSpace: 'nowrap' }}>or continue with</span>
          <div style={{ flex: 1, height: 1, background: 'var(--color-hairline)' }} />
        </div>

        {/* Google Sign In */}
        <button onClick={signInWithGoogle} style={{
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          padding: '11px 20px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-hairline)',
          borderRadius: 9999,
          fontSize: 15, fontWeight: 500,
          color: 'var(--color-ink)',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-soft)',
          transition: 'box-shadow 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-elevated)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-soft)'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p style={{ fontSize: 12, color: 'var(--color-ink-faint)', marginTop: 24, lineHeight: 1.6 }}>
          By continuing, you agree to Noteify's Terms of Service and Privacy Policy.
        </p>
      </div>

      <p style={{ marginTop: 24, fontSize: 13, color: 'var(--color-ink-faint)' }}>
        © 2026 Noteify
      </p>
    </div>
  )
}
