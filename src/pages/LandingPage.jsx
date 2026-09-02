// src/pages/LandingPage.jsx
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { Sun, Moon, FileText, CheckSquare, Database, Users, ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const FEATURES = [
  {
    icon: <FileText size={22} />,
    color: '#d6b6f6',
    title: 'Notes & Docs',
    desc: 'Write anything — notes, docs, wikis — with a powerful rich text editor that gets out of your way.',
  },
  {
    icon: <CheckSquare size={22} />,
    color: '#62aef0',
    title: 'Tasks',
    desc: 'Manage work with status filters, priorities, due dates and a clean list view.',
  },
  {
    icon: <Database size={22} />,
    color: '#ff64c8',
    title: 'Databases',
    desc: 'Create custom tables, define columns, and structure any kind of data your way.',
  },
  {
    icon: <Users size={22} />,
    color: '#2a9d99',
    title: 'CRM',
    desc: 'Track contacts, companies and deals through a visual pipeline. Built for real sales work.',
  },
]

const PLANS = [
  {
    name: 'Free',
    price: '₦0',
    period: '/month',
    featured: false,
    cta: 'Get started free',
    features: ['Unlimited pages', '10 MB file uploads', 'Basic CRM', '7-day page history', 'Share via link'],
  },
  {
    name: 'Pro',
    price: '₦5,000',
    period: '/month',
    featured: true,
    cta: 'Start Pro',
    features: ['Everything in Free', 'Unlimited uploads', 'Advanced CRM + Pipeline', 'Unlimited history', 'REST API access', 'Priority support'],
  },
]

// Typing animation hook
function useTypingEffect(words, speed = 80, pause = 1800) {
  const [displayed, setDisplayed] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = words[wordIndex]
    let timeout

    if (!deleting && charIndex < current.length) {
      timeout = setTimeout(() => setCharIndex(c => c + 1), speed)
    } else if (!deleting && charIndex === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause)
    } else if (deleting && charIndex > 0) {
      timeout = setTimeout(() => setCharIndex(c => c - 1), speed / 2)
    } else if (deleting && charIndex === 0) {
      setDeleting(false)
      setWordIndex(i => (i + 1) % words.length)
    }

    setDisplayed(current.slice(0, charIndex))
    return () => clearTimeout(timeout)
  }, [charIndex, deleting, wordIndex, words, speed, pause])

  return displayed
}

// Scroll reveal hook
function useScrollReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return [ref, visible]
}

// Floating note cards for hero
const NOTES = [
  { text: '📝 Project roadmap — Q4 2026', top: '18%', left: '6%', delay: 0, rotate: -4 },
  { text: '✅ Follow up with the client', top: '55%', left: '4%', delay: 0.3, rotate: 3 },
  { text: '📊 CRM: 5 new leads this week', top: '75%', left: '8%', delay: 0.6, rotate: -2 },
  { text: '🗒️ Weekly team sync notes', top: '20%', right: '5%', delay: 0.2, rotate: 4 },
  { text: '📅 Sprint planning — Thursday', top: '58%', right: '4%', delay: 0.5, rotate: -3 },
]

function FloatingCard({ note, index }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), note.delay * 1000 + 400)
    return () => clearTimeout(t)
  }, [note.delay])

  return (
    <div style={{
      position: 'absolute',
      top: note.top,
      left: note.left,
      right: note.right,
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: 10,
      padding: '10px 14px',
      fontSize: 13,
      color: 'rgba(255,255,255,0.85)',
      whiteSpace: 'nowrap',
      backdropFilter: 'blur(8px)',
      transform: `rotate(${note.rotate}deg) translateY(${mounted ? 0 : 20}px)`,
      opacity: mounted ? 1 : 0,
      transition: `opacity 0.6s ease, transform 0.6s ease`,
      animation: mounted ? `floatY 3s ease-in-out ${index * 0.7}s infinite alternate` : 'none',
      pointerEvents: 'none',
    }}>
      {note.text}
    </div>
  )
}

function RevealSection({ children, style }) {
  const [ref, visible] = useScrollReveal()
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(32px)',
      transition: 'opacity 0.65s ease, transform 0.65s ease',
      ...style,
    }}>
      {children}
    </div>
  )
}

export default function LandingPage() {
  const { signInWithGoogle, user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [heroMounted, setHeroMounted] = useState(false)

  const typedText = useTypingEffect(['your notes.', 'your tasks.', 'your CRM.', 'your team.'])

  useEffect(() => {
    const t = setTimeout(() => setHeroMounted(true), 100)
    return () => clearTimeout(t)
  }, [])

  const handleCTA = () => user ? navigate('/app') : navigate('/login')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-canvas)', overflowX: 'hidden' }}>
      <style>{`
        @keyframes floatY {
          from { transform: rotate(var(--rot, 0deg)) translateY(0px); }
          to   { transform: rotate(var(--rot, 0deg)) translateY(-10px); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'var(--color-canvas)',
        borderBottom: '1px solid var(--color-hairline)',
        padding: '0 40px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.3 }}>Noteify</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={toggleTheme} style={{ padding: 7, borderRadius: 'var(--rounded-md)', background: 'var(--color-canvas-soft)', border: '1px solid var(--color-hairline)', color: 'var(--color-ink-muted)', display: 'flex' }}>
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          </button>
          {user
            ? <button className="btn-primary" style={{ padding: '6px 16px', fontSize: 14 }} onClick={() => navigate('/app')}>Open workspace</button>
            : <button className="btn-primary" style={{ padding: '6px 16px', fontSize: 14 }} onClick={() => navigate('/login')}>Sign in</button>
          }
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: 'var(--color-secondary)', color: '#fff', padding: '96px 40px 108px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Floating note cards */}
        {NOTES.map((note, i) => <FloatingCard key={i} note={note} index={i} />)}

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: 'var(--rounded-full)', padding: '4px 12px', fontSize: 13, marginBottom: 28,
          opacity: heroMounted ? 1 : 0,
          transform: heroMounted ? 'translateY(0)' : 'translateY(-12px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1aae39', display: 'inline-block', animation: 'pulse-dot 2s ease infinite' }} />
          Now in beta — free to get started
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(38px,6vw,64px)', fontWeight: 700, lineHeight: 1.05,
          letterSpacing: '-2px', maxWidth: 760, margin: '0 auto 22px',
          opacity: heroMounted ? 1 : 0,
          transform: heroMounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s',
        }}>
          One place for<br />
          <span style={{ color: 'rgba(255,255,255,0.55)' }}>all </span>
          {typedText}
          <span style={{ animation: 'cursor-blink 1s step-end infinite', borderRight: '3px solid rgba(255,255,255,0.7)', marginLeft: 2 }} />
        </h1>

        {/* Subtext */}
        <p style={{
          fontSize: 18, color: 'rgba(255,255,255,0.68)', maxWidth: 500, margin: '0 auto 40px', lineHeight: 1.65,
          opacity: heroMounted ? 1 : 0,
          transform: heroMounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s',
        }}>
          Notes, docs, tasks, databases and a full CRM — in one beautifully simple workspace.
        </p>

        {/* CTAs */}
        <div style={{
          display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap',
          opacity: heroMounted ? 1 : 0,
          transform: heroMounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s ease 0.35s, transform 0.6s ease 0.35s',
        }}>
          <button className="btn-primary" onClick={handleCTA} style={{ fontSize: 16, padding: '12px 28px', gap: 8 }}>
            {user ? 'Open my workspace' : 'Get started free'} <ArrowRight size={16} />
          </button>
          <button className="btn-secondary" style={{ fontSize: 16, padding: '12px 28px', background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.18)', color: '#fff' }}>
            See features
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '88px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <RevealSection style={{ marginBottom: 56 }}>
          <div className="badge" style={{ display: 'inline-flex', marginBottom: 14 }}>Features</div>
          <h2 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 700, letterSpacing: -1, maxWidth: 500 }}>
            Everything you need, nothing you don't.
          </h2>
        </RevealSection>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
          {FEATURES.map((f, i) => (
            <RevealSection key={f.title} style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="card" style={{ borderTop: `3px solid ${f.color}`, padding: '22px 22px 24px', height: '100%', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-soft)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--rounded-md)', background: f.color + '22', color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  {f.icon}
                </div>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: 'var(--color-ink-muted)', lineHeight: 1.65 }}>{f.desc}</div>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* SHARE SECTION */}
      <section style={{ background: 'var(--color-canvas-soft)', padding: '80px 40px' }}>
        <RevealSection>
          <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--rounded-md)', background: '#e0f0ff', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5, marginBottom: 14 }}>Share your work with anyone</h2>
            <p style={{ fontSize: 16, color: 'var(--color-ink-muted)', lineHeight: 1.7 }}>
              Publish any page as a read-only link. No account required for viewers.
              Perfect for sharing notes, reports, or CRM data with clients and colleagues.
            </p>
          </div>
        </RevealSection>
      </section>

      {/* API SECTION */}
      <section style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
        <RevealSection>
          <div className="badge" style={{ display: 'inline-flex', marginBottom: 14 }}>REST API</div>
          <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5, marginBottom: 14 }}>Connect to your tools</h2>
          <p style={{ fontSize: 15, color: 'var(--color-ink-muted)', lineHeight: 1.7, marginBottom: 20 }}>
            Pro users get full API access. Connect Noteify to n8n, Zapier, Make, or any custom workflow.
            Read and write pages, tasks, CRM contacts and deals programmatically.
          </p>
          <button className="btn-primary" onClick={handleCTA} style={{ gap: 7 }}>Get Pro access <ArrowRight size={15} /></button>
        </RevealSection>
        <RevealSection>
          <div style={{ background: '#1a1a2e', borderRadius: 'var(--rounded-xl)', padding: 24, fontFamily: 'monospace', fontSize: 13, color: '#e2e8f0', lineHeight: 1.8 }}>
            <div style={{ color: '#64748b', marginBottom: 8 }}>// Get all tasks via REST API</div>
            <div><span style={{ color: '#62aef0' }}>GET</span> <span style={{ color: '#1aae39' }}>/api/v1/tasks</span></div>
            <div style={{ color: '#64748b' }}>x-api-key: your_api_key</div>
            <br />
            <div><span style={{ color: '#62aef0' }}>POST</span> <span style={{ color: '#1aae39' }}>/api/v1/crm/contacts</span></div>
            <div style={{ color: '#64748b' }}>&#123; "full_name": "Jane Doe", ... &#125;</div>
          </div>
        </RevealSection>
      </section>

      {/* PRICING */}
      <section style={{ background: 'var(--color-canvas-soft)', padding: '88px 40px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <RevealSection style={{ textAlign: 'center', marginBottom: 52 }}>
            <div className="badge" style={{ display: 'inline-flex', marginBottom: 14 }}>Pricing</div>
            <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1 }}>Simple, honest pricing</h2>
          </RevealSection>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 20 }}>
            {PLANS.map((plan, i) => (
              <RevealSection key={plan.name} style={{ transitionDelay: `${i * 0.15}s` }}>
                <div style={{
                  background: 'var(--color-surface)',
                  border: `1px solid ${plan.featured ? 'var(--color-primary)' : 'var(--color-hairline)'}`,
                  borderRadius: 'var(--rounded-md)',
                  padding: 28,
                  position: 'relative',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                  {plan.featured && (
                    <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--color-primary)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 'var(--rounded-full)' }}>
                      Recommended
                    </span>
                  )}
                  <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6 }}>{plan.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 22 }}>
                    <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1 }}>{plan.price}</span>
                    <span style={{ color: 'var(--color-ink-muted)', fontSize: 14 }}>{plan.period}</span>
                  </div>
                  <ul style={{ listStyle: 'none', marginBottom: 26 }}>
                    {plan.features.map(f => (
                      <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '5px 0', fontSize: 14, color: 'var(--color-ink-secondary)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1aae39" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button className={plan.featured ? 'btn-primary' : 'btn-utility'} onClick={handleCTA} style={{ width: '100%', justifyContent: 'center' }}>
                    {plan.cta}
                  </button>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'var(--color-canvas)', borderTop: '1px solid var(--color-hairline)', padding: '32px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: 5, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Noteify</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-ink-faint)' }}>© 2026 Noteify. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
