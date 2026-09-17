// src/components/Sidebar.jsx
import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import { FileText, CheckSquare, Users, Database, Code2, Plus, Sun, Moon, LogOut, Shield, ChevronDown, ChevronRight, Settings, UserPlus, Building2, PlusCircle } from 'lucide-react'

const NAV = [
  {
    path: '/app', label: 'Home',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    color: '#d6b6f6', bg: '#f3eeff'
  },
  { path: '/app/tasks', label: 'Tasks', icon: <CheckSquare size={15} />, color: '#62aef0', bg: '#e8f4ff' },
  { path: '/app/crm', label: 'CRM', icon: <Users size={15} />, color: '#ff64c8', bg: '#fff0fb' },
  { path: '/app/database', label: 'Database', icon: <Database size={15} />, color: '#2a9d99', bg: '#e6f7f7' },
]

function WorkspaceDropdown({ onClose, user, profile, workspace, signOut, navigate, isAdmin }) {
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const menuItem = (icon, label, onClick, danger = false) => (
    <button onClick={() => { onClick(); onClose() }} style={{
      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
      padding: '8px 12px', fontSize: 13, borderRadius: 6,
      color: danger ? '#c0392b' : 'var(--color-ink-secondary)',
      background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
      transition: 'background 0.1s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = danger ? '#fef2f2' : 'var(--color-canvas-soft)'}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
      <span style={{ color: danger ? '#c0392b' : 'var(--color-ink-muted)', display: 'flex', flexShrink: 0 }}>{icon}</span>
      {label}
    </button>
  )

  return (
    <div ref={ref} style={{
      position: 'absolute', top: '100%', left: 8, right: 8, zIndex: 200,
      background: 'var(--color-surface)', border: '1px solid var(--color-hairline)',
      borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', overflow: 'hidden', marginTop: 4,
    }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-hairline)', background: 'var(--color-canvas-soft)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'U')}&size=36&background=0075de&color=fff`}
            alt="avatar" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.full_name || 'My Account'}</div>
            <div style={{ fontSize: 11, color: 'var(--color-ink-faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
          </div>
        </div>
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 18, height: 18, borderRadius: 4, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
            {workspace?.name?.[0] || 'N'}
          </div>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-ink-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{workspace?.name || 'My Workspace'}</span>
          <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 9999, background: profile?.plan === 'pro' ? '#e8f4ff' : 'var(--color-hairline)', color: profile?.plan === 'pro' ? '#0075de' : 'var(--color-ink-faint)', whiteSpace: 'nowrap' }}>
            {profile?.plan === 'pro' ? 'Pro' : 'Free'}
          </span>
        </div>
      </div>
      <div style={{ padding: '6px' }}>
        {menuItem(<Settings size={14} />, 'Settings', () => navigate('/app/settings'))}
        {menuItem(<UserPlus size={14} />, 'Invite members', () => navigate('/app/invite'))}
        {menuItem(<Building2 size={14} />, 'Add account', () => navigate('/app/invite'))}
        {isAdmin && menuItem(<Shield size={14} />, 'Admin Dashboard', () => navigate('/admin'))}
      </div>
      <div style={{ borderTop: '1px solid var(--color-hairline)', padding: '6px' }}>
        {menuItem(<PlusCircle size={14} />, 'New workspace', () => navigate('/app/settings'))}
      </div>
      <div style={{ borderTop: '1px solid var(--color-hairline)', padding: '6px' }}>
        {menuItem(<LogOut size={14} />, 'Log out', () => { signOut(); navigate('/') }, true)}
      </div>
    </div>
  )
}

export default function Sidebar({ pages = [], onNewPage, mobileOpen, setMobileOpen, collapsed, setCollapsed }) {
  const { user, profile, workspace, signOut, isAdmin } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [pagesOpen, setPagesOpen] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)

  const handleNewPage = async () => {
    if (!workspace) return
    const { data } = await supabase.from('pages').insert({
      workspace_id: workspace.id, owner_id: user.id, title: 'Untitled', type: 'page',
    }).select().single()
    if (data) { onNewPage(data); navigate(`/app/page/${data.id}`) }
  }

  const go = (path) => { navigate(path); setMobileOpen(false) }

  return (
    <>
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }} />
      )}
      <aside className={`sidebar${mobileOpen ? ' open' : ''}`} style={{
        zIndex: 100,
        width: collapsed ? 0 : undefined,
        minWidth: collapsed ? 0 : undefined,
        overflow: collapsed ? 'hidden' : undefined,
        transition: 'width 0.22s ease, min-width 0.22s ease',
      }}>

        {/* Workspace header */}
        <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid var(--color-hairline)', position: 'relative' }}>
          <div onClick={() => setShowDropdown(d => !d)} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
            borderRadius: 'var(--rounded-md)', cursor: 'pointer', transition: 'background 0.1s',
            background: showDropdown ? 'var(--color-canvas-soft)' : 'transparent',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-canvas-soft)'}
            onMouseLeave={e => { if (!showDropdown) e.currentTarget.style.background = 'transparent' }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
              {workspace?.name?.[0] || 'N'}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{workspace?.name || 'My Workspace'}</div>
              <div style={{ fontSize: 11, color: 'var(--color-ink-faint)' }}>{profile?.plan === 'pro' ? 'Pro plan' : 'Free plan'}</div>
            </div>
            <ChevronDown size={13} color="var(--color-ink-faint)" style={{ flexShrink: 0, transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
          </div>
          {showDropdown && (
            <WorkspaceDropdown onClose={() => setShowDropdown(false)} user={user} profile={profile}
              workspace={workspace} signOut={signOut} navigate={navigate} isAdmin={isAdmin} />
          )}
        </div>

        {/* Nav */}
        <div className="sidebar-section">
          {NAV.map(item => {
            const isActive = location.pathname === item.path
            return (
              <button key={item.path} className={`sidebar-row${isActive ? ' active' : ''}`} onClick={() => go(item.path)}>
                <span style={{ width: 22, height: 22, borderRadius: 5, flexShrink: 0, background: isActive ? item.color + '33' : item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* Pages */}
        <div className="sidebar-section" style={{ flex: 1 }}>
          <div className="sidebar-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setPagesOpen(o => !o)}>
            <span>Pages</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button onClick={(e) => { e.stopPropagation(); handleNewPage() }} style={{ padding: 2, borderRadius: 4, color: 'var(--color-ink-faint)', display: 'flex' }}>
                <Plus size={13} />
              </button>
              {pagesOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </div>
          </div>
          {pagesOpen && (
            <div>
              {pages.filter(p => !p.is_deleted).map(page => (
                <button key={page.id} className={`sidebar-row${location.pathname === `/app/page/${page.id}` ? ' active' : ''}`} onClick={() => go(`/app/page/${page.id}`)}>
                  <span style={{ width: 22, height: 22, borderRadius: 5, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={12} color="#888" />
                  </span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, textAlign: 'left' }}>{page.title || 'Untitled'}</span>
                </button>
              ))}
              {pages.length === 0 && <div style={{ padding: '6px 8px', fontSize: 13, color: 'var(--color-ink-faint)', fontStyle: 'italic' }}>No pages yet</div>}
            </div>
          )}
        </div>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid var(--color-hairline)', padding: 8 }}>
          <button className={`sidebar-row${location.pathname === '/app/integrations' ? ' active' : ''}`} onClick={() => go('/app/integrations')}>
            <span style={{ width: 22, height: 22, borderRadius: 5, background: '#fff1e6', color: '#dd5b00', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Code2 size={13} />
            </span>
            <span>Integrations</span>
          </button>
          <button className="sidebar-row" onClick={toggleTheme}>
            <span style={{ width: 22, height: 22, borderRadius: 5, background: 'var(--color-hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {theme === 'light' ? <Moon size={13} /> : <Sun size={13} />}
            </span>
            <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 8px 4px', marginTop: 4 }}>
            <img src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'U')}&size=28&background=0075de&color=fff`}
              alt="avatar" style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ fontSize: 13, overflow: 'hidden' }}>
              <div style={{ fontWeight: 500, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{profile?.full_name || user?.email}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
