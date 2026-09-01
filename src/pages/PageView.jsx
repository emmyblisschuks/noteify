// src/pages/PageView.jsx
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Editor from '../components/Editor'
import { Share2, Globe, Lock, Check, Trash2 } from 'lucide-react'

export default function PageView({ onTitleChange }) {
  const { id } = useParams()
  const { user } = useAuth()
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [title, setTitle] = useState('')

  useEffect(() => {
    if (id) fetchPage()
  }, [id])

  async function fetchPage() {
    setLoading(true)
    const { data } = await supabase.from('pages').select('*').eq('id', id).single()
    if (data) { setPage(data); setTitle(data.title) }
    setLoading(false)
  }

  const saveContent = useCallback(async (content) => {
    setSaving(true)
    await supabase.from('pages').update({ content }).eq('id', id)
    setTimeout(() => setSaving(false), 600)
  }, [id])

  const saveTitle = async (newTitle) => {
    setTitle(newTitle)
    await supabase.from('pages').update({ title: newTitle || 'Untitled' }).eq('id', id)
    onTitleChange?.(id, newTitle || 'Untitled')
  }

  const togglePublic = async () => {
    const newVal = !page.is_public
    await supabase.from('pages').update({ is_public: newVal }).eq('id', id)
    setPage(p => ({ ...p, is_public: newVal }))
  }

  const copyShareLink = () => {
    const url = `${window.location.origin}/share/${page.public_token}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const deletePage = async () => {
    if (!confirm('Move this page to trash?')) return
    await supabase.from('pages').update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq('id', id)
    window.history.back()
  }

  if (loading) return <div style={{ padding: 48, color: 'var(--color-ink-faint)' }}>Loading…</div>
  if (!page) return <div style={{ padding: 48, color: 'var(--color-ink-faint)' }}>Page not found</div>

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 32px' }}>
      {/* Page icon + title */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 8, cursor: 'pointer' }}>{page.icon || '📄'}</div>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={e => saveTitle(e.target.value)}
          placeholder="Untitled"
          style={{
            display: 'block', width: '100%', fontSize: 40, fontWeight: 700,
            letterSpacing: -1, lineHeight: 1.15, border: 'none', outline: 'none',
            background: 'transparent', color: 'var(--color-ink)',
            fontFamily: 'var(--font)'
          }}
        />
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--color-ink-faint)' }}>
          {saving ? 'Saving…' : 'Saved'}
        </span>
        <div style={{ flex: 1 }} />
        <button className="btn-utility" onClick={togglePublic} style={{ gap: 6 }}>
          {page.is_public ? <><Globe size={13} /> Public</> : <><Lock size={13} /> Private</>}
        </button>
        {page.is_public && (
          <button className="btn-utility" onClick={copyShareLink} style={{ gap: 6 }}>
            {copied ? <><Check size={13} /> Copied!</> : <><Share2 size={13} /> Copy link</>}
          </button>
        )}
        <button onClick={deletePage} style={{ padding: '4px 8px', borderRadius: 'var(--rounded-md)', color: 'var(--color-ink-faint)', display: 'flex', alignItems: 'center' }}>
          <Trash2 size={14} />
        </button>
      </div>

      {/* Editor */}
      <Editor
        key={id}
        content={page.content}
        onChange={saveContent}
        placeholder="Start writing, press / for commands…"
      />
    </div>
  )
}
