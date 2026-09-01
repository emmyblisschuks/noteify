// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../context/ThemeContext'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, FileText, CheckSquare, TrendingUp, ArrowLeft, Sun, Moon, Crown, UserCheck } from 'lucide-react'
import { format, subDays } from 'date-fns'

const COLORS = ['#0075de', '#2a9d99', '#dd5b00', '#ff64c8']

export default function AdminDashboard() {
  const { isAdmin, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ totalUsers: 0, freeUsers: 0, proUsers: 0, totalPages: 0, totalTasks: 0, totalDeals: 0 })
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [userGrowth, setUserGrowth] = useState([])
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!isAdmin) { navigate('/app'); return }
    fetchData()
  }, [isAdmin])

  async function fetchData() {
    setLoading(true)
    const [
      { data: profiles },
      { count: pageCount },
      { count: taskCount },
      { count: dealCount },
    ] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('pages').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
      supabase.from('tasks').select('*', { count: 'exact', head: true }),
      supabase.from('crm_deals').select('*', { count: 'exact', head: true }),
    ])

    const profs = profiles || []
    setUsers(profs)
    setStats({
      totalUsers: profs.length,
      freeUsers: profs.filter(p => p.plan === 'free').length,
      proUsers: profs.filter(p => p.plan === 'pro').length,
      totalPages: pageCount || 0,
      totalTasks: taskCount || 0,
      totalDeals: dealCount || 0,
      monthlyRevenue: profs.filter(p => p.plan === 'pro').length * 5000,
    })

    // Fake growth data for last 14 days (replace with real query if needed)
    const growthData = Array.from({ length: 14 }, (_, i) => {
      const date = subDays(new Date(), 13 - i)
      const usersUpToDate = profs.filter(p => new Date(p.created_at) <= date).length
      return { date: format(date, 'MMM d'), users: usersUpToDate }
    })
    setUserGrowth(growthData)
    setLoading(false)
  }

  const toggleUserAdmin = async (userId, current) => {
    await supabase.from('profiles').update({ is_admin: !current }).eq('id', userId)
    setUsers(us => us.map(u => u.id === userId ? { ...u, is_admin: !current } : u))
  }

  const toggleUserPlan = async (userId, current) => {
    const newPlan = current === 'pro' ? 'free' : 'pro'
    await supabase.from('profiles').update({ plan: newPlan }).eq('id', userId)
    setUsers(us => us.map(u => u.id === userId ? { ...u, plan: newPlan } : u))
    fetchData()
  }

  const planData = [
    { name: 'Free', value: stats.freeUsers },
    { name: 'Pro', value: stats.proUsers },
  ]

  if (!isAdmin) return null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-canvas)' }}>
      {/* Top bar */}
      <div style={{ height: 56, borderBottom: '1px solid var(--color-hairline)', display: 'flex', alignItems: 'center', padding: '0 28px', gap: 12, background: 'var(--color-canvas)', position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => navigate('/app')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-ink-muted)', fontSize: 14 }}>
          <ArrowLeft size={15} /> Back to app
        </button>
        <div style={{ flex: 1 }} />
        <span style={{ fontWeight: 700, fontSize: 16 }}>🛡️ Admin Dashboard</span>
        <div style={{ flex: 1 }} />
        <button onClick={toggleTheme} style={{ padding: 8, borderRadius: 'var(--rounded-md)', background: 'var(--color-canvas-soft)', display: 'flex' }}>
          {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
        </button>
      </div>

      <div style={{ padding: '32px 40px', maxWidth: 1200, margin: '0 auto' }}>
        {loading ? <div style={{ color: 'var(--color-ink-faint)', padding: 48 }}>Loading admin data…</div> : (
          <>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 36 }}>
              {[
                { label: 'Total users', value: stats.totalUsers, icon: <Users size={20} />, color: '#0075de' },
                { label: 'Pro users', value: stats.proUsers, icon: <Crown size={20} />, color: '#dd5b00' },
                { label: 'Monthly revenue', value: `₦${(stats.monthlyRevenue || 0).toLocaleString()}`, icon: <TrendingUp size={20} />, color: '#1aae39' },
                { label: 'Total pages', value: stats.totalPages, icon: <FileText size={20} />, color: '#2a9d99' },
                { label: 'Total tasks', value: stats.totalTasks, icon: <CheckSquare size={20} />, color: '#d6b6f6' },
                { label: 'CRM deals', value: stats.totalDeals, icon: <TrendingUp size={20} />, color: '#ff64c8' },
              ].map(s => (
                <div key={s.label} className="card" style={{ borderLeft: `4px solid ${s.color}`, padding: '16px 18px' }}>
                  <div style={{ color: s.color, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 26, fontWeight: 700 }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-ink-muted)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
              {[['overview', '📊 Overview'], ['users', '👥 Users']].map(([t, l]) => (
                <button key={t} onClick={() => setActiveTab(t)} className={activeTab === t ? 'btn-primary' : 'btn-utility'} style={{ fontSize: 13 }}>{l}</button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                {/* User growth chart */}
                <div className="card">
                  <h3 style={{ fontWeight: 600, marginBottom: 20 }}>User growth (last 14 days)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={userGrowth}>
                      <defs>
                        <linearGradient id="uGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0075de" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#0075de" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hairline)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--color-ink-faint)" />
                      <YAxis tick={{ fontSize: 11 }} stroke="var(--color-ink-faint)" />
                      <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-hairline)', borderRadius: 8 }} />
                      <Area type="monotone" dataKey="users" stroke="#0075de" fill="url(#uGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Plan distribution */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <h3 style={{ fontWeight: 600, marginBottom: 20, alignSelf: 'flex-start' }}>Plan distribution</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={planData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                        {planData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                    {planData.map((p, i) => (
                      <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i] }} />
                        {p.name}: {p.value}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent signups */}
                <div className="card" style={{ gridColumn: '1 / -1' }}>
                  <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Recent signups</h3>
                  <table className="data-table">
                    <thead><tr><th>User</th><th>Email</th><th>Plan</th><th>Joined</th></tr></thead>
                    <tbody>
                      {users.slice(0, 8).map(u => (
                        <tr key={u.id}>
                          <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <img src={u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || 'U')}&size=28`} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
                            {u.full_name || '—'}
                          </div></td>
                          <td>{u.email}</td>
                          <td><span style={{ background: u.plan === 'pro' ? '#e0f0ff' : '#f0f0f0', color: u.plan === 'pro' ? '#0075de' : '#555', padding: '2px 8px', borderRadius: 99, fontSize: 12 }}>{u.plan}</span></td>
                          <td>{format(new Date(u.created_at), 'MMM d, yyyy')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                  <thead><tr><th>User</th><th>Email</th><th>Plan</th><th>Admin</th><th>Joined</th><th>Actions</th></tr></thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <img src={u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || 'U')}&size=28`} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
                          {u.full_name || '—'}
                        </div></td>
                        <td>{u.email}</td>
                        <td><span style={{ background: u.plan === 'pro' ? '#e0f0ff' : '#f0f0f0', color: u.plan === 'pro' ? '#0075de' : '#555', padding: '2px 8px', borderRadius: 99, fontSize: 12 }}>{u.plan}</span></td>
                        <td>{u.is_admin ? <span style={{ color: '#1aae39', fontSize: 13 }}>✓ Admin</span> : '—'}</td>
                        <td style={{ fontSize: 12 }}>{format(new Date(u.created_at), 'MMM d, yyyy')}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn-utility" style={{ fontSize: 11 }} onClick={() => toggleUserPlan(u.id, u.plan)}>
                              {u.plan === 'pro' ? '→ Free' : '→ Pro'}
                            </button>
                            <button className="btn-utility" style={{ fontSize: 11 }} onClick={() => toggleUserAdmin(u.id, u.is_admin)}>
                              {u.is_admin ? 'Remove admin' : 'Make admin'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
