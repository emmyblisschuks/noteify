// src/pages/HomePage.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Plus, FileText, CheckSquare, Users, Database } from 'lucide-react'
import { format } from 'date-fns'

export default function HomePage({ pages, onNewPage }) {
  const { user, profile, workspace } = useAuth()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [deals, setDeals] = useState([])

  useEffect(() => { if (workspace) fetchData() }, [workspace])

  async function fetchData() {
    const [{ data: t }, { data: d }] = await Promise.all([
      supabase.from('tasks').select('*').eq('workspace_id', workspace.id).eq('status', 'todo').order('created_at', { ascending: false }).limit(5),
      supabase.from('crm_deals').select('*').eq('workspace_id', workspace.id).in('stage', ['lead','qualified','proposal']).limit(5),
    ])
    setTasks(t || [])
    setDeals(d || [])
  }

  const handleNewPage = async () => {
    if (!workspace) return
    const { data } = await supabase.from('pages').insert({ workspace_id: workspace.id, owner_id: user.id, title: 'Untitled', type: 'page' }).select().single()
    if (data) { onNewPage(data); navigate(`/app/page/${data.id}`) }
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const recentPages = pages.filter(p => !p.is_deleted).slice(0, 6)

  const quickActions = [
    { icon: <FileText size={28} color="#d6b6f6" />, label: 'New page', action: handleNewPage, color: '#d6b6f6' },
    { icon: <CheckSquare size={28} color="#62aef0" />, label: 'View tasks', action: () => navigate('/app/tasks'), color: '#62aef0' },
    { icon: <Users size={28} color="#ff64c8" />, label: 'Open CRM', action: () => navigate('/app/crm'), color: '#ff64c8' },
    { icon: <Database size={28} color="#2a9d99" />, label: 'Database', action: () => navigate('/app/database'), color: '#2a9d99' },
  ]

  return (
    <>
      <style>{`
        .home-wrap { padding: 48px 40px; max-width: 900px; margin: 0 auto; }
        .home-greeting h1 { font-size: 36px; font-weight: 700; letter-spacing: -1px; margin-bottom: 6px; }
        .quick-actions { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 40px; }
        .home-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        @media (max-width: 768px) {
          .home-wrap { padding: 24px 16px; }
          .home-greeting h1 { font-size: 26px; }
          .quick-actions { grid-template-columns: 1fr 1fr; }
          .home-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="home-wrap">
        {/* Greeting */}
        <div className="home-greeting" style={{ marginBottom: 32 }}>
          <h1>{greeting}, {firstName} 👋</h1>
          <p style={{ color: 'var(--color-ink-muted)', fontSize: 15 }}>{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>

        {/* Quick actions */}
        <div className="quick-actions">
          {quickActions.map(item => (
            <button key={item.label} onClick={item.action} className="card"
              style={{ cursor: 'pointer', textAlign: 'left', transition: 'box-shadow 0.15s', borderTop: `3px solid ${item.color}` }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-soft)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              <div style={{ marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</div>
            </button>
          ))}
        </div>

        {/* Recent + Tasks */}
        <div className="home-grid">
          {/* Recent pages */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600 }}>Recent pages</h2>
              <button className="btn-utility" onClick={handleNewPage} style={{ fontSize: 12, gap: 4 }}><Plus size={12} /> New</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {recentPages.length === 0 ? (
                <div style={{ padding: '20px 0', color: 'var(--color-ink-faint)', fontSize: 14 }}>No pages yet. Create your first one!</div>
              ) : recentPages.map(p => (
                <button key={p.id} onClick={() => navigate(`/app/page/${p.id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 'var(--rounded-md)', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-canvas-soft)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ fontSize: 16 }}>{p.icon || '📄'}</span>
                  <span style={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title || 'Untitled'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Upcoming tasks */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600 }}>Upcoming tasks</h2>
              <button className="btn-utility" onClick={() => navigate('/app/tasks')} style={{ fontSize: 12 }}>View all</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {tasks.length === 0 ? (
                <div style={{ padding: '20px 0', color: 'var(--color-ink-faint)', fontSize: 14 }}>All clear! No pending tasks.</div>
              ) : tasks.map(t => (
                <div key={t.id} onClick={() => navigate('/app/tasks')}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 'var(--rounded-md)', cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-canvas-soft)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ fontSize: 15 }}>◯</span>
                  <span style={{ fontSize: 14, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                  {t.due_date && <span style={{ fontSize: 12, color: 'var(--color-ink-faint)' }}>{format(new Date(t.due_date), 'MMM d')}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active deals */}
        {deals.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600 }}>Active deals</h2>
              <button className="btn-utility" onClick={() => navigate('/app/crm')} style={{ fontSize: 12 }}>CRM →</button>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {deals.map(d => (
                <div key={d.id} onClick={() => navigate('/app/crm')} className="card"
                  style={{ cursor: 'pointer', minWidth: 140, flex: '0 0 auto', padding: '12px 14px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{d.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-primary)' }}>₦{(d.value || 0).toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-ink-faint)', marginTop: 4, textTransform: 'capitalize' }}>{d.stage}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
