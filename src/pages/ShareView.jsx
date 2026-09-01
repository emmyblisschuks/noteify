// src/pages/ShareView.jsx
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon, Globe } from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Typography from '@tiptap/extension-typography'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'

export default function ShareView() {
  const { token } = useParams()
  const { theme, toggleTheme } = useTheme()
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const editor = useEditor({
    extensions: [StarterKit, Typography, TaskList, TaskItem.configure({ nested: true })],
    content: '',
    editable: false,
  })

  useEffect(() => {
    fetchPage()
  }, [token])

  useEffect(() => {
    if (editor && page?.content) {
      editor.commands.setContent(page.content)
    }
  }, [editor, page])

  async function fetchPage() {
    const { data } = await supabase
      .from('pages')
      .select('title, icon, content, created_at, updated_at')
      .eq('public_token', token)
      .eq('is_public', true)
      .single()

    if (!data) setNotFound(true)
    else setPage(data)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-canvas)' }}>
      {/* Top bar */}
      <div style={{
        height: 52, borderBottom: '1px solid var(--color-hairline)',
        display: 'flex', alignItems: 'center', padding: '0 28px', gap: 12,
        position: 'sticky', top: 0, background: 'var(--color-canvas)', zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Noteify</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-ink-faint)' }}>
          <Globe size={12} />
          Published
        </div>
        <button onClick={toggleTheme} style={{ padding: 7, borderRadius: 'var(--rounded-md)', background: 'var(--color-canvas-soft)', border: '1px solid var(--color-hairline)', color: 'var(--color-ink-muted)', display: 'flex' }}>
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
        </button>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '56px 32px' }}>
        {loading && <div style={{ color: 'var(--color-ink-faint)' }}>Loading…</div>}
        {notFound && (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 20, opacity: 0.3 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10 }}>Page not found</h2>
            <p style={{ color: 'var(--color-ink-muted)', fontSize: 15 }}>This page doesn't exist or has been made private.</p>
          </div>
        )}
        {page && (
          <>
            <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1, lineHeight: 1.15, marginBottom: 32 }}>
              {page.title || 'Untitled'}
            </h1>
            <EditorContent editor={editor} />
          </>
        )}
      </div>
    </div>
  )
}
