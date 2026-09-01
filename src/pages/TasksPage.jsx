// src/pages/TasksPage.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Plus, Flag, Calendar, CheckCircle2, Circle, X } from 'lucide-react'
import { format } from 'date-fns'

const STATUSES = ['todo', 'in_progress', 'done', 'cancelled']
const PRIORITIES = ['low', 'medium', 'high', 'urgent']
const PRIORITY_COLORS = { low: '#a39e98', medium: '#dd5b00', high: '#e74c3c', urgent: '#c0392b' }

function TaskModal({ task, onSave, onClose, workspaceId, userId }) {
  const [form, setForm] = useState(task || { title: '', description: '', status: 'todo', priority: 'medium', due_date: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    if (!form.title.trim()) return
    if (task?.id) {
      await supabase.from('tasks').update({ ...form, due_date: form.due_date || null }).eq('id', task.id)
    } else {
      await supabase.from('tasks').insert({ ...form, workspace_id: workspaceId, owner_id: userId, due_date: form.due_date || null })
    }
    onSave()
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 18 }}>{task ? 'Edit task' : 'New task'}</h3>
          <button onClick={onClose} style={{ color: 'var(--color-ink-faint)' }}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field"><label>Title</label><input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Task name" /></div>
          <div className="field"><label>Description</label><textarea className="input" rows={3} value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="Optional details" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field"><label>Status</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="field"><label>Priority</label>
              <select className="input" value={form.priority} onChange={e => set('priority', e.target.value)}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="field"><label>Due date</label><input type="date" className="input" value={form.due_date ? form.due_date.slice(0,10) : ''} onChange={e => set('due_date', e.target.value)} /></div>
          <button className="btn-primary" onClick={save} style={{ alignSelf: 'flex-end' }}>Save task</button>
        </div>
      </div>
    </div>
  )
}

export default function TasksPage() {
  const { user, workspace } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => { if (workspace) fetchTasks() }, [workspace])

  async function fetchTasks() {
    const { data } = await supabase.from('tasks').select('*').eq('workspace_id', workspace.id).order('created_at', { ascending: false })
    setTasks(data || [])
    setLoading(false)
  }

  const deleteTask = async (id) => {
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(t => t.filter(x => x.id !== id))
  }

  const toggleDone = async (task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id)
    setTasks(t => t.map(x => x.id === task.id ? { ...x, status: newStatus } : x))
  }

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)

  return (
    <div style={{ padding: '32px 40px', maxWidth: 840, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>Tasks</h1>
          <p style={{ color: 'var(--color-ink-muted)', fontSize: 14, marginTop: 4 }}>{tasks.filter(t => t.status !== 'done').length} remaining</p>
        </div>
        <button className="btn-primary" onClick={() => setModal({ new: true })} style={{ gap: 6 }}><Plus size={15} /> New task</button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={filter === s ? 'btn-primary' : 'btn-utility'}
            style={{ fontSize: 13, padding: '4px 12px' }}>
            {s === 'all' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? <div style={{ color: 'var(--color-ink-faint)', padding: 24 }}>Loading…</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-ink-faint)' }}>No tasks here. Create one!</div>}
          {filtered.map(task => (
            <div key={task.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
              onClick={() => setModal(task)}>
              <button onClick={e => { e.stopPropagation(); toggleDone(task) }} style={{ color: task.status === 'done' ? 'var(--color-accent-green)' : 'var(--color-ink-faint)', display: 'flex' }}>
                {task.status === 'done' ? <CheckCircle2 size={18} /> : <Circle size={18} />}
              </button>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 15, fontWeight: 500, textDecoration: task.status === 'done' ? 'line-through' : 'none', color: task.status === 'done' ? 'var(--color-ink-faint)' : 'var(--color-ink)' }}>
                  {task.title}
                </div>
                {task.description && <div style={{ fontSize: 13, color: 'var(--color-ink-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.description}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <Flag size={13} color={PRIORITY_COLORS[task.priority]} />
                {task.due_date && <span style={{ fontSize: 12, color: 'var(--color-ink-muted)', display: 'flex', alignItems: 'center', gap: 3 }}><Calendar size={11} />{format(new Date(task.due_date), 'MMM d')}</span>}
                <span className={`status-badge status-${task.status}`}>{task.status.replace('_', ' ')}</span>
                <button onClick={e => { e.stopPropagation(); deleteTask(task.id) }} style={{ color: 'var(--color-ink-faint)', display: 'flex' }}><X size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <TaskModal
          task={modal.new ? null : modal}
          workspaceId={workspace?.id}
          userId={user?.id}
          onSave={fetchTasks}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
