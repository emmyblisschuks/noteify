// src/App.jsx
import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { supabase } from './lib/supabase'
import Sidebar from './components/Sidebar'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import AuthCallback from './pages/AuthCallback'
import HomePage from './pages/HomePage'
import PageView from './pages/PageView'
import TasksPage from './pages/TasksPage'
import CRMPage from './pages/CRMPage'
import DatabasePage from './pages/DatabasePage'
import ShareView from './pages/ShareView'
import AdminDashboard from './pages/admin/AdminDashboard'
import IntegrationsPage from './pages/IntegrationsPage'
import { Menu, X } from 'lucide-react'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ color: 'var(--color-ink-faint)', fontSize: 14 }}>Loading…</div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppShell() {
  const { workspace } = useAuth()
  const [pages, setPages] = useState([])
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  useEffect(() => { if (workspace) fetchPages() }, [workspace])
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  async function fetchPages() {
    const { data } = await supabase
      .from('pages')
      .select('id, title, icon, type, is_deleted, position')
      .eq('workspace_id', workspace.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
    setPages(data || [])
  }

  const handleNewPage = (page) => setPages(p => [page, ...p])
  const handleTitleChange = (id, title) => setPages(p => p.map(x => x.id === id ? { ...x, title } : x))

  return (
    <div className="app-shell">
      <Sidebar
        pages={pages}
        onNewPage={handleNewPage}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <div className="main-content">
        <div className="topbar">
          <button
            onClick={() => {
              if (window.innerWidth <= 768) {
                setMobileOpen(o => !o)
              } else {
                setCollapsed(o => !o)
              }
            }}
            style={{ display: 'flex', padding: 6, borderRadius: 'var(--rounded-md)', color: 'var(--color-ink-muted)' }}>
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Routes>
            <Route path="/" element={<HomePage pages={pages} onNewPage={handleNewPage} />} />
            <Route path="/page/:id" element={<PageView onTitleChange={handleTitleChange} />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/crm" element={<CRMPage />} />
            <Route path="/database" element={<DatabasePage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/share/:token" element={<ShareView />} />
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/app/*" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
