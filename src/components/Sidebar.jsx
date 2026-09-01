// src/components/Sidebar.jsx
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import { FileText, CheckSquare, Users, TrendingUp, Database, Plus, Sun, Moon, LogOut, Settings, Shield, ChevronDown, ChevronRight, Hash } from 'lucide-react'

const NAV = [
  { path: '/app', icon: '🏠', label: 'Home' },
  { path: '/app/tasks', icon: '✅', label: 'Tasks' },
  { path: '/app/crm', icon: '🤝', label: 'CRM' },
  { path: '/app/database', icon: '🗄️', label: 'Database' },
]

export default function Sidebar({ pages = [], onNewPage, mobileOpen, setMobileOpen }) {
  const { user, profile, workspace, signOut, isAdmin } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [pagesOpen, setPagesOpen] = useState(true)

  const handleNewPage = async () => {
    if (!workspace) return
    const { data } = await supabase.from('pages').insert({
      workspace_id: workspace.id,
      owner_id: user.id,
      title: 'Untitled',
      type: 'page',
    }).select().single()
    if (data) { onNewPage(data); navigate(`/app/page/${data.id}`) }
  }

  return (
    <>
      {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 99 }} />}
      <aside className={`sidebar${mobileOpen ? ' open' : ''}`}>
        {/* Workspace header */}
        <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid var(--color-hairline)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 'var(--rounded-md)', cursor: 'pointer' }}
            onClick={() => navigate('/app')}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700 }}>
              {workspace?.name?.[0] || 'N'}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {workspace?.name || 'My Workspace'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-ink-faint)' }}>{profile?.plan === 'pro' ? '⭐ Pro' : 'Free plan'}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="sidebar-section">
          {NAV.map(item => (
            <button key={item.path} className={`sidebar-row${location.pathname === item.path ? ' active' : ''}`}
              onClick={() => { navigate(item.path); setMobileOpen(false) }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Pages */}
        <div className="sidebar-section" style={{ flex: 1 }}>
          <div className="sidebar-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
            onClick={() => setPagesOpen(o => !o)}>
            <span>Pages</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button onClick={(e) => { e.stopPropagation(); handleNewPage() }}
                style={{ padding: 2, borderRadius: 4, color: 'var(--color-ink-faint)', display: 'flex' }}>
                <Plus size={13} />
              </button>
              {pagesOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </div>
          </div>
          {pagesOpen && (
            <div>
              {pages.filter(p => !p.is_deleted).map(page => (
                <button key={page.id} className={`sidebar-row${location.pathname === `/app/page/${page.id}` ? ' active' : ''}`}
                  onClick={() => { navigate(`/app/page/${page.id}`); setMobileOpen(false) }}>
                  <span style={{ fontSize: 14 }}>{page.icon || '📄'}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, textAlign: 'left' }}>{page.title || 'Untitled'}</span>
                </button>
              ))}
              {pages.length === 0 && (
                <div style={{ padding: '6px 8px', fontSize: 13, color: 'var(--color-ink-faint)', fontStyle: 'italic' }}>No pages yet</div>
              )}
            </div>
          )}
        </div>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid var(--color-hairline)', padding: 8 }}>
          {isAdmin && (
            <button className="sidebar-row" onClick={() => navigate('/admin')}>
              <Shield size={14} />
              <span>Admin Dashboard</span>
            </button>
          )}
          <button className="sidebar-row" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
          </button>
          <button className="sidebar-row" onClick={() => { signOut(); navigate('/') }}>
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', marginTop: 4 }}>
            <img src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'U')}`}
              alt="avatar" style={{ width: 26, height: 26, borderRadius: '50%' }} />
            <div style={{ fontSize: 13, overflow: 'hidden' }}>
              <div style={{ fontWeight: 500, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{profile?.full_name || user?.email}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
