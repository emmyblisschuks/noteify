// src/components/Sidebar.jsx
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import { FileText, CheckSquare, Users, Database, Code2, Plus, Sun, Moon, LogOut, Shield, ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

const NAV = [
  {
    path: '/app', label: 'Home',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    color: '#d6b6f6', bg: '#f3eeff'
  },
  {
    path: '/app/tasks', label: 'Tasks',
    icon: <CheckSquare size={15} />,
    color: '#62aef0', bg: '#e8f4ff'
  },
  {
    path: '/app/crm', label: 'CRM',
    icon: <Users size={15} />,
    color: '#ff64c8', bg: '#fff0fb'
  },
  {
    path: '/app/database', label: 'Database',
    icon: <Database size={15} />,
    color: '#2a9d99', bg: '#e6f7f7'
  },
]

export default function Sidebar({ pages = [], onNewPage, mobileOpen, setMobileOpen, collapsed, setCollapsed }) {
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

  const go = (path) => {
    navigate(path)
    setMobileOpen(false)
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 99 }} />
      )}

      <aside className={`sidebar${mobileOpen ? ' open' : ''}${collapsed ? ' collapsed' : ''}`}
        style={{
          width: collapsed ? 56 : 240,
          minWidth: collapsed ? 56 : 240,
          transition: 'width 0.22s ease, min-width 0.22s ease',
          overflow: 'hidden',
        }}>

        {/* Workspace header */}
        <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid var(--color-hairline)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 'var(--rounded-md)', cursor: 'pointer', flex: 1, overflow: 'hidden' }}
              onClick={() => go('/app')}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                {workspace?.name?.[0] || 'N'}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {workspace?.name || 'My Workspace'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-ink-faint)' }}>{profile?.plan === 'pro' ? 'Pro plan' : 'Free plan'}</div>
              </div>
            </div>
          )}

          {collapsed && (
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', margin: '0 auto' }}
              onClick={() => go('/app')}>
              {workspace?.name?.[0] || 'N'}
            </div>
          )}

          {!collapsed && (
            <button onClick={() => setCollapsed(true)}
              title="Collapse sidebar"
              style={{ padding: 4, borderRadius: 'var(--rounded-md)', color: 'var(--color-ink-faint)', display: 'flex', flexShrink: 0, marginLeft: 4 }}>
              <PanelLeftClose size={15} />
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <div style={{ padding: '8px 0', display: 'flex', justifyContent: 'center', borderBottom: '1px solid var(--color-hairline)' }}>
            <button onClick={() => setCollapsed(false)}
              title="Expand sidebar"
              style={{ padding: 6, borderRadius: 'var(--rounded-md)', color: 'var(--color-ink-faint)', display: 'flex' }}>
              <PanelLeftOpen size={15} />
            </button>
          </div>
        )}

        {/* Nav */}
        <div className="sidebar-section">
          {NAV.map(item => {
            const isActive = location.pathname === item.path
            return (
              <button key={item.path}
                className={`sidebar-row${isActive ? ' active' : ''}`}
                title={collapsed ? item.label : ''}
                onClick={() => go(item.path)}
                style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 5, flexShrink: 0,
                  background: isActive ? item.color + '33' : item.bg,
                  color: item.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s'
                }}>
                  {item.icon}
                </span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            )
          })}
        </div>

        {/* Pages */}
        {!collapsed && (
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
                    onClick={() => go(`/app/page/${page.id}`)}>
                    <span style={{ width: 22, height: 22, borderRadius: 5, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={12} color="#888" />
                    </span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, textAlign: 'left' }}>{page.title || 'Untitled'}</span>
                  </button>
                ))}
                {pages.length === 0 && (
                  <div style={{ padding: '6px 8px', fontSize: 13, color: 'var(--color-ink-faint)', fontStyle: 'italic' }}>No pages yet</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bottom */}
        <div style={{ borderTop: '1px solid var(--color-hairline)', padding: 8 }}>
          {isAdmin && (
            <button className="sidebar-row" title={collapsed ? 'Admin' : ''}
              onClick={() => go('/admin')}
              style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}>
              <span style={{ width: 22, height: 22, borderRadius: 5, background: '#e8f0ff', color: '#213183', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Shield size={13} />
              </span>
              {!collapsed && <span>Admin Dashboard</span>}
            </button>
          )}

          <button className={`sidebar-row${location.pathname === '/app/integrations' ? ' active' : ''}`}
            title={collapsed ? 'Integrations' : ''}
            onClick={() => go('/app/integrations')}
            style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}>
            <span style={{ width: 22, height: 22, borderRadius: 5, background: '#fff1e6', color: '#dd5b00', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Code2 size={13} />
            </span>
            {!collapsed && <span>Integrations</span>}
          </button>

          <button className="sidebar-row" title={collapsed ? (theme === 'light' ? 'Dark mode' : 'Light mode') : ''}
            onClick={toggleTheme}
            style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}>
            <span style={{ width: 22, height: 22, borderRadius: 5, background: 'var(--color-hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {theme === 'light' ? <Moon size={13} /> : <Sun size={13} />}
            </span>
            {!collapsed && <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>}
          </button>

          <button className="sidebar-row" title={collapsed ? 'Sign out' : ''}
            onClick={() => { signOut(); navigate('/') }}
            style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}>
            <span style={{ width: 22, height: 22, borderRadius: 5, background: '#fae5e5', color: '#c0392b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <LogOut size={13} />
            </span>
            {!collapsed && <span>Sign out</span>}
          </button>

          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 8px 4px', marginTop: 4 }}>
              <img src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'U')}&size=28`}
                alt="avatar" style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ fontSize: 13, overflow: 'hidden' }}>
                <div style={{ fontWeight: 500, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{profile?.full_name || user?.email}</div>
              </div>
            </div>
          )}

          {collapsed && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}>
              <img src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'U')}&size=28`}
                alt="avatar" style={{ width: 26, height: 26, borderRadius: '50%' }} />
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
