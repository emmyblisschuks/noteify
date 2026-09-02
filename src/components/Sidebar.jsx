// src/components/Sidebar.jsx
import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import { FileText, CheckSquare, Users, Database, Code2, Plus, Sun, Moon, LogOut, Shield, ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen, Settings, UserPlus, UserCog, ArrowUpCircle, Check, X, Loader } from 'lucide-react'

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

function WorkspaceDropdown({ workspace, allWorkspaces, profile, user, signOut, navigate, onClose, switchWorkspace, createWorkspace, addMemberByEmail }) {
  const ref = useRef(null)
  const [view, setView] = useState('main') // main | new-workspace | add-account
  const [wsName, setWsName] = useState('')
  const [memberEmail, setMemberEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  const initial = workspace?.name?.[0]?.toUpperCase() || 'N'
  const plan = profile?.plan === 'pro' ? 'Pro plan' : 'Free plan'

  async function handleCreateWorkspace() {
    if (!wsName.trim()) return
    setLoading(true); setError('')
    const { error } = await createWorkspace(wsName)
    setLoading(false)
    if (error) { setError(error.message); return }
    setWsName('')
    setView('main')
  }

  async function handleAddMember() {
    if (!memberEmail.trim()) return
    setLoading(true); setError(''); setSuccess('')
    const { error, profile: p } = await addMemberByEmail(memberEmail)
    setLoading(false)
    if (error) { setError(typeof error === 'string' ? error : error.message); return }
    setSuccess(`${p.full_name || memberEmail} added to workspace!`)
    setMemberEmail('')
    setTimeout(() => { setSuccess(''); setView('main') }, 2000)
  }

  const inputStyle = {
    padding: '8px 10px', fontSize: 13,
    border: '1px solid var(--color-hairline)',
    borderRadius: 6, background: 'var(--color-canvas-soft)',
    color: 'var(--color-ink)', outline: 'none',
    width: '100%', boxSizing: 'border-box',
  }

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 56, left: 8, right: 8,
      background: 'var(--color-surface)',
      border: '1px solid var(--color-hairline)',
      borderRadius: 'var(--rounded-lg)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      zIndex: 200, overflow: 'hidden',
    }}>

      {/* New Workspace view */}
      {view === 'new-workspace' && (
        <div style={{ padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>New workspace</div>
            <button onClick={() => { setView('main'); setError(''); setWsName('') }} style={{ color: 'var(--color-ink-faint)', display: 'flex' }}><X size={14} /></button>
          </div>
          <input style={inputStyle} placeholder="Workspace name" value={wsName} onChange={e => setWsName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateWorkspace()} autoFocus />
          {error && <div style={{ fontSize: 12, color: '#c0392b', marginTop: 6 }}>{error}</div>}
          <button onClick={handleCreateWorkspace} disabled={loading || !wsName.trim()} style={{
            marginTop: 10, width: '100%', padding: '8px 0', fontSize: 13, fontWeight: 500,
            background: 'var(--color-primary)', color: '#fff', borderRadius: 6, cursor: 'pointer',
            opacity: !wsName.trim() ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            {loading ? <><Loader size={13} /> Creating…</> : 'Create workspace'}
          </button>
        </div>
      )}

      {/* Add Account (member) view */}
      {view === 'add-account' && (
        <div style={{ padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Add member</div>
            <button onClick={() => { setView('main'); setError(''); setSuccess(''); setMemberEmail('') }} style={{ color: 'var(--color-ink-faint)', display: 'flex' }}><X size={14} /></button>
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-ink-faint)', marginBottom: 10 }}>
            Enter the email of an existing Noteify user to give them access to this workspace.
          </div>
          <input style={inputStyle} placeholder="colleague@email.com" type="email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddMember()} autoFocus />
          {error && <div style={{ fontSize: 12, color: '#c0392b', marginTop: 6 }}>{error}</div>}
          {success && <div style={{ fontSize: 12, color: '#166534', marginTop: 6 }}>{success}</div>}
          <button onClick={handleAddMember} disabled={loading || !memberEmail.trim()} style={{
            marginTop: 10, width: '100%', padding: '8px 0', fontSize: 13, fontWeight: 500,
            background: 'var(--color-primary)', color: '#fff', borderRadius: 6, cursor: 'pointer',
            opacity: !memberEmail.trim() ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            {loading ? <><Loader size={13} /> Adding…</> : 'Add to workspace'}
          </button>
        </div>
      )}

      {/* Main view */}
      {view === 'main' && (
        <>
          {/* Workspace info */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-hairline)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
                {initial}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{workspace?.name || 'My Workspace'}</div>
                <div style={{ fontSize: 12, color: 'var(--color-ink-faint)' }}>{plan} · 1 member</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ padding: '6px 0' }}>
            {[
              { icon: <ArrowUpCircle size={15} />, label: 'Upgrade', color: 'var(--color-primary)', action: () => { navigate('/app/upgrade'); onClose() } },
              { icon: <Settings size={15} />, label: 'Settings', action: () => { navigate('/app/settings'); onClose() } },
              { icon: <UserPlus size={15} />, label: 'Invite members', action: () => { navigate('/app/invite'); onClose() } },
              { icon: <UserCog size={15} />, label: 'Add account', action: () => setView('add-account') },
            ].map(item => (
              <button key={item.label} onClick={item.action} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '8px 14px', fontSize: 14,
                color: item.color || 'var(--color-ink)', transition: 'background 0.1s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-canvas-soft)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={{ color: item.color || 'var(--color-ink-muted)' }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Workspace switcher */}
          <div style={{ borderTop: '1px solid var(--color-hairline)', padding: '6px 0' }}>
            <div style={{ padding: '4px 14px 6px', fontSize: 11, color: 'var(--color-ink-faint)', fontWeight: 500 }}>{user?.email}</div>
            {allWorkspaces.map(ws => (
              <button key={ws.id} onClick={() => { switchWorkspace(ws); onClose() }} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '7px 14px', fontSize: 14, transition: 'background 0.1s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-canvas-soft)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ width: 22, height: 22, borderRadius: 5, background: 'var(--color-canvas-soft)', border: '1px solid var(--color-hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                  {ws.name?.[0]?.toUpperCase()}
                </div>
                <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ws.name}</span>
                {ws.id === workspace?.id && <Check size={13} color="var(--color-primary)" />}
              </button>
            ))}
            <button onClick={() => setView('new-workspace')} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '7px 14px', fontSize: 14, color: 'var(--color-primary)', transition: 'background 0.1s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--color-canvas-soft)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Plus size={14} /> New workspace
            </button>
          </div>

          {/* Log out */}
          <div style={{ borderTop: '1px solid var(--color-hairline)', padding: '6px 0' }}>
            <button onClick={() => { signOut(); navigate('/'); onClose() }} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '8px 14px', fontSize: 14, color: 'var(--color-ink)', transition: 'background 0.1s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--color-canvas-soft)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <LogOut size={14} color="var(--color-ink-muted)" /> Log out
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function Sidebar({ pages = [], onNewPage, mobileOpen, setMobileOpen, collapsed, setCollapsed }) {
  const { user, profile, workspace, allWorkspaces, signOut, isAdmin, switchWorkspace, createWorkspace, addMemberByEmail } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [pagesOpen, setPagesOpen] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)

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
        <div onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 99 }} />
      )}

      <aside className={`sidebar${mobileOpen ? ' open' : ''}${collapsed ? ' collapsed' : ''}`}
        style={{ width: collapsed ? 56 : 240, minWidth: collapsed ? 56 : 240, transition: 'width 0.22s ease, min-width 0.22s ease', overflow: 'hidden', position: 'relative' }}>

        {/* Workspace header */}
        <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid var(--color-hairline)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          {!collapsed ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 'var(--rounded-md)', cursor: 'pointer', flex: 1, overflow: 'hidden' }}
                onClick={() => setDropdownOpen(o => !o)}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                  {workspace?.name?.[0] || 'N'}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{workspace?.name || 'My Workspace'}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-ink-faint)' }}>{profile?.plan === 'pro' ? 'Pro plan' : 'Free plan'}</div>
                </div>
                <ChevronDown size={13} style={{ color: 'var(--color-ink-faint)', flexShrink: 0, transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
              </div>
              <button onClick={() => setCollapsed(true)} title="Collapse sidebar"
                style={{ padding: 4, borderRadius: 'var(--rounded-md)', color: 'var(--color-ink-faint)', display: 'flex', flexShrink: 0, marginLeft: 4 }}>
                <PanelLeftClose size={15} />
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: '100%' }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                onClick={() => setCollapsed(false)}>
                {workspace?.name?.[0] || 'N'}
              </div>
              <button onClick={() => setCollapsed(false)} title="Expand sidebar"
                style={{ padding: 4, borderRadius: 'var(--rounded-md)', color: 'var(--color-ink-faint)', display: 'flex' }}>
                <PanelLeftOpen size={14} />
              </button>
            </div>
          )}

          {dropdownOpen && !collapsed && (
            <WorkspaceDropdown
              workspace={workspace}
              allWorkspaces={allWorkspaces}
              profile={profile}
              user={user}
              signOut={signOut}
              navigate={navigate}
              onClose={() => setDropdownOpen(false)}
              switchWorkspace={switchWorkspace}
              createWorkspace={createWorkspace}
              addMemberByEmail={addMemberByEmail}
            />
          )}
        </div>

        {/* Nav */}
        <div className="sidebar-section">
          {NAV.map(item => {
            const isActive = location.pathname === item.path
            return (
              <button key={item.path} className={`sidebar-row${isActive ? ' active' : ''}`}
                title={collapsed ? item.label : ''} onClick={() => go(item.path)}
                style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}>
                <span style={{ width: 22, height: 22, borderRadius: 5, flexShrink: 0, background: isActive ? item.color + '33' : item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
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
            <button className="sidebar-row" title={collapsed ? 'Admin' : ''} onClick={() => go('/admin')}
              style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}>
              <span style={{ width: 22, height: 22, borderRadius: 5, background: '#e8f0ff', color: '#213183', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Shield size={13} />
              </span>
              {!collapsed && <span>Admin Dashboard</span>}
            </button>
          )}
          <button className={`sidebar-row${location.pathname === '/app/integrations' ? ' active' : ''}`}
            title={collapsed ? 'Integrations' : ''} onClick={() => go('/app/integrations')}
            style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}>
            <span style={{ width: 22, height: 22, borderRadius: 5, background: '#fff1e6', color: '#dd5b00', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Code2 size={13} />
            </span>
            {!collapsed && <span>Integrations</span>}
          </button>
          <button className="sidebar-row" title={collapsed ? (theme === 'light' ? 'Dark mode' : 'Light mode') : ''} onClick={toggleTheme}
            style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}>
            <span style={{ width: 22, height: 22, borderRadius: 5, background: 'var(--color-hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {theme === 'light' ? <Moon size={13} /> : <Sun size={13} />}
            </span>
            {!collapsed && <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>}
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
