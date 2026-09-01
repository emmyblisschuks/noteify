// src/pages/LoginPage.jsx
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function LoginPage() {
  const { signInWithGoogle, user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/app')
  }, [user])

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
        borderRadius: 'var(--rounded-xl)',
        padding: '48px 44px',
        width: '100%',
        maxWidth: 400,
        boxShadow: 'var(--shadow-elevated)',
        textAlign: 'center'
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            width: 44, height: 44,
            borderRadius: 'var(--rounded-md)',
            background: 'var(--color-primary)',
            margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, marginBottom: 8 }}>
            Welcome to Noteify
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-ink-muted)', lineHeight: 1.6 }}>
            Your all-in-one workspace for notes,<br />tasks, databases and CRM.
          </p>
        </div>

        {/* Google Sign In */}
        <button onClick={signInWithGoogle} style={{
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          padding: '11px 20px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-hairline)',
          borderRadius: 'var(--rounded-md)',
          fontSize: 15, fontWeight: 500,
          color: 'var(--color-ink)',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-soft)',
          transition: 'box-shadow 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-elevated)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-soft)'}
        >
          {/* Google SVG */}
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
