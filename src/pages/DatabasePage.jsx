// src/pages/DatabasePage.jsx
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Plus, X, Table2, Type, Hash, CheckSquare, Calendar, Link, Mail, ChevronDown, List, Trash2 } from 'lucide-react'

const COLUMN_TYPES = [
  { type: 'text', label: 'Text', icon: <Type size={13} /> },
  { type: 'number', label: 'Number', icon: <Hash size={13} /> },
  { type: 'select', label: 'Select', icon: <ChevronDown size={13} /> },
  { type: 'multi_select', label: 'Multi-select', icon: <List size={13} /> },
  { type: 'checkbox', label: 'Checkbox', icon: <CheckSquare size={13} /> },
  { type: 'date', label: 'Date', icon: <Calendar size={13} /> },
  { type: 'url', label: 'URL', icon: <Link size={13} /> },
  { type: 'email', label: 'Email', icon: <Mail size={13} /> },
]

function getTypeIcon(type) {
  return COLUMN_TYPES.find(t => t.type === type)?.icon || <Type size={13} />
}

// Column context menu on right click
function ColumnContextMenu({ x, y, col, onDelete, onRename, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div ref={ref} style={{
      position: 'fixed', top: y, left: x, zIndex: 500,
      background: 'var(--color-surface)',
      border: '1px solid var(--color-hairline)',
      borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      minWidth: 160, padding: '4px 0',
    }}>
      <div style={{ padding: '6px 12px 4px', fontSize: 11, fontWeight: 600, color: 'var(--color-ink-faint)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {col.name}
      </div>
      <button onClick={onRename} style={{
        display: 'flex', alignItems: 'center', gap: 8, width: '100%',
        padding: '8px 12px', fontSize: 13, color: 'var(--color-ink)',
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-canvas-soft)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <Type size={13} color="var(--color-ink-muted)" /> Rename column
      </button>
      {col.name !== 'Name' && (
        <button onClick={onDelete} style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          padding: '8px 12px', fontSize: 13, color: '#c0392b',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <Trash2 size={13} /> Delete column
        </button>
      )}
    </div>
  )
}

function TypePicker({ onSelect, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div ref={ref} style={{
      position: 'absolute', top: '100%', left: 0, zIndex: 300,
      background: 'var(--color-surface)', border: '1px solid var(--color-hairline)',
      borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 180, padding: '4px 0',
    }}>
      <div style={{ padding: '6px 12px 4px', fontSize: 11, fontWeight: 600, color: 'var(--color-ink-faint)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Select type</div>
      {COLUMN_TYPES.map(t => (
        <button key={t.type} onClick={() => onSelect(t.type)} style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          padding: '7px 12px', fontSize: 13, color: 'var(--color-ink)', transition: 'background 0.1s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-canvas-soft)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <span style={{ color: 'var(--color-ink-muted)' }}>{t.icon}</span> {t.label}
        </button>
      ))}
    </div>
  )
}

function AddColumnPanel({ onAdd, onClose }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('text')
  const [showTypePicker, setShowTypePicker] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const selectedType = COLUMN_TYPES.find(t => t.type === type)

  return (
    <div ref={ref} style={{
      position: 'absolute', top: '100%', right: 0, zIndex: 300,
      background: 'var(--color-surface)', border: '1px solid var(--color-hairline)',
      borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', width: 230, padding: 14,
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>New column</div>
      <div style={{ marginBottom: 8 }}>
        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-ink-muted)', display: 'block', marginBottom: 5 }}>Column name</label>
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Priority"
          onKeyDown={e => e.key === 'Enter' && name.trim() && onAdd(name, type)}
          style={{
            width: '100%', padding: '7px 10px', fontSize: 13,
            border: '1px solid var(--color-hairline)', borderRadius: 6,
            background: 'var(--color-canvas-soft)', color: 'var(--color-ink)',
            outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-ink-muted)', display: 'block', marginBottom: 5 }}>Data type</label>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowTypePicker(p => !p)} style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
            padding: '7px 10px', fontSize: 13, borderRadius: 6,
            border: '1px solid var(--color-hairline)', background: 'var(--color-canvas-soft)',
            color: 'var(--color-ink)', cursor: 'pointer', justifyContent: 'space-between',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--color-ink-muted)' }}>{selectedType?.icon}</span> {selectedType?.label}
            </span>
            <ChevronDown size={12} />
          </button>
          {showTypePicker && (
            <TypePicker onSelect={t => { setType(t); setShowTypePicker(false) }} onClose={() => setShowTypePicker(false)} />
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => name.trim() && onAdd(name, type)} disabled={!name.trim()} style={{
          flex: 1, padding: '7px 0', fontSize: 13, fontWeight: 500,
          background: 'var(--color-primary)', color: '#fff', borderRadius: 6, border: 'none',
          cursor: name.trim() ? 'pointer' : 'not-allowed', opacity: name.trim() ? 1 : 0.5,
        }}>Add column</button>
        <button onClick={onClose} style={{ padding: '7px 10px', fontSize: 13, borderRadius: 6, border: '1px solid var(--color-hairline)', background: 'var(--color-canvas-soft)', cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  )
}

function CellDisplay({ value, col }) {
  if (value === undefined || value === null || value === '') {
    return <span style={{ color: 'var(--color-ink-faint)', fontSize: 12 }}>—</span>
  }
  if (col.type === 'checkbox') {
    return <span style={{ fontSize: 16 }}>{value ? '☑' : '☐'}</span>
  }
  if (col.type === 'select' || col.type === 'multi_select') {
    const tags = Array.isArray(value) ? value : [value]
    return (
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {tags.map((t, i) => (
          <span key={i} style={{ fontSize: 12, padding: '2px 8px', borderRadius: 9999, background: '#e8f4ff', color: '#0075de', fontWeight: 500 }}>{t}</span>
        ))}
      </div>
    )
  }
  if (col.type === 'url') {
    return <a href={value} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', fontSize: 13, textDecoration: 'underline' }} onClick={e => e.stopPropagation()}>{value}</a>
  }
  return <span style={{ fontSize: 13 }}>{value}</span>
}

function CellEditor({ value, col, onSave, onClose }) {
  const [val, setVal] = useState(value ?? (col.type === 'checkbox' ? false : col.type === 'multi_select' ? [] : ''))
  const [tagInput, setTagInput] = useState('')
  const ref = useRef(null)

  useEffect(() => { ref.current?.focus?.() }, [])

  function save() { onSave(val); onClose() }

  if (col.type === 'checkbox') {
    return <input type="checkbox" checked={!!val} onChange={e => { onSave(e.target.checked); onClose() }} style={{ width: 16, height: 16, cursor: 'pointer' }} />
  }

  if (col.type === 'select') {
    const options = col.options || []
    return (
      <div style={{ minWidth: 160, background: 'var(--color-surface)', border: '1px solid var(--color-hairline)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', padding: '4px 0', position: 'absolute', zIndex: 400 }}>
        <input ref={ref} value={val} onChange={e => setVal(e.target.value)} placeholder="Type or select..."
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') onClose() }}
          style={{ width: '100%', padding: '7px 10px', fontSize: 13, border: 'none', borderBottom: '1px solid var(--color-hairline)', outline: 'none', background: 'transparent', boxSizing: 'border-box' }} />
        {options.filter(o => o.toLowerCase().includes(val?.toLowerCase() || '')).map(o => (
          <button key={o} onClick={() => { onSave(o); onClose() }} style={{ display: 'block', width: '100%', padding: '7px 10px', textAlign: 'left', fontSize: 13 }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-canvas-soft)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 9999, background: '#e8f4ff', color: '#0075de' }}>{o}</span>
          </button>
        ))}
        <button onClick={save} style={{ display: 'block', width: '100%', padding: '7px 10px', textAlign: 'left', fontSize: 12, color: 'var(--color-ink-faint)' }}>
          + Save "{val}"
        </button>
      </div>
    )
  }

  if (col.type === 'multi_select') {
    const tags = Array.isArray(val) ? val : []
    return (
      <div style={{ minWidth: 200, background: 'var(--color-surface)', border: '1px solid var(--color-hairline)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', padding: 8, position: 'absolute', zIndex: 400 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
          {tags.map((t, i) => (
            <span key={i} style={{ fontSize: 12, padding: '2px 8px', borderRadius: 9999, background: '#e8f4ff', color: '#0075de', display: 'flex', alignItems: 'center', gap: 4 }}>
              {t}
              <button onClick={() => setVal(tags.filter((_, j) => j !== i))} style={{ color: '#0075de', display: 'flex' }}><X size={10} /></button>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <input ref={ref} value={tagInput} onChange={e => setTagInput(e.target.value)}
            placeholder="Add option..."
            style={{ flex: 1, padding: '5px 8px', fontSize: 13, border: '1px solid var(--color-hairline)', borderRadius: 6, outline: 'none', background: 'var(--color-canvas-soft)' }}
            onKeyDown={e => {
              if (e.key === 'Enter' && tagInput.trim()) { setVal([...tags, tagInput.trim()]); setTagInput('') }
              if (e.key === 'Escape') { onSave(tags); onClose() }
            }} />
          <button onClick={() => { onSave(tags); onClose() }} style={{ padding: '5px 10px', fontSize: 12, background: 'var(--color-primary)', color: '#fff', borderRadius: 6, cursor: 'pointer', border: 'none' }}>Done</button>
        </div>
      </div>
    )
  }

  if (col.type === 'date') {
    return <input ref={ref} type="date" value={val} onChange={e => setVal(e.target.value)}
      onBlur={save} onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') onClose() }}
      style={{ padding: '4px 8px', fontSize: 13, border: '1px solid var(--color-hairline)', borderRadius: 6, outline: 'none', background: 'var(--color-surface)' }} />
  }

  if (col.type === 'number') {
    return <input ref={ref} type="number" value={val} onChange={e => setVal(e.target.value)}
      onBlur={save} onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') onClose() }}
      style={{ width: '100%', padding: '2px 4px', fontSize: 13, border: 'none', outline: 'none', background: 'transparent' }} />
  }

  return <input ref={ref} value={val} onChange={e => setVal(e.target.value)}
    onBlur={save} onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') onClose() }}
    style={{ width: '100%', padding: '2px 4px', fontSize: 13, border: 'none', outline: 'none', background: 'transparent' }} />
}

export default function DatabasePage() {
  const { user, workspace } = useAuth()
  const [tables, setTables] = useState([])
  const [activeTable, setActiveTable] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTableName, setNewTableName] = useState('')
  const [showNewTable, setShowNewTable] = useState(false)
  const [editingCell, setEditingCell] = useState(null)
  const [showAddColumn, setShowAddColumn] = useState(false)
  const [contextMenu, setContextMenu] = useState(null) // { col, x, y }
  const [renamingCol, setRenamingCol] = useState(null) // col id
  const [renameVal, setRenameVal] = useState('')

  useEffect(() => { if (workspace) fetchTables() }, [workspace])
  useEffect(() => { if (activeTable) fetchRows(activeTable.id) }, [activeTable])

  // Close context menu on scroll/click
  useEffect(() => {
    const close = () => setContextMenu(null)
    document.addEventListener('scroll', close, true)
    return () => document.removeEventListener('scroll', close, true)
  }, [])

  async function fetchTables() {
    const { data } = await supabase.from('db_tables').select('*').eq('owner_id', user.id).order('created_at')
    setTables(data || [])
    if (data?.length && !activeTable) setActiveTable(data[0])
    setLoading(false)
  }

  async function fetchRows(tableId) {
    const { data } = await supabase.from('db_rows').select('*').eq('table_id', tableId).order('position')
    setRows(data || [])
  }

  const createTable = async () => {
    if (!newTableName.trim()) return
    // Only Name column by default
    const defaultCols = [
      { id: '1', name: 'Name', type: 'text' },
    ]
    const { data } = await supabase.from('db_tables').insert({
      page_id: null, owner_id: user.id, name: newTableName, columns: defaultCols
    }).select().single()
    if (data) { setTables(t => [...t, data]); setActiveTable(data); setNewTableName(''); setShowNewTable(false) }
  }

  const addRow = async () => {
    if (!activeTable) return
    const { data } = await supabase.from('db_rows').insert({
      table_id: activeTable.id, owner_id: user.id, data: {}, position: rows.length
    }).select().single()
    if (data) setRows(r => [...r, data])
  }

  const updateCell = async (rowId, colId, value) => {
    const row = rows.find(r => r.id === rowId)
    const newData = { ...row.data, [colId]: value }
    await supabase.from('db_rows').update({ data: newData }).eq('id', rowId)
    setRows(rs => rs.map(r => r.id === rowId ? { ...r, data: newData } : r))
  }

  const deleteRow = async (id) => {
    await supabase.from('db_rows').delete().eq('id', id)
    setRows(r => r.filter(x => x.id !== id))
  }

  const addColumn = async (name, type) => {
    const newCol = { id: Date.now().toString(), name, type, options: type === 'select' || type === 'multi_select' ? [] : undefined }
    const cols = [...(activeTable.columns || []), newCol]
    await supabase.from('db_tables').update({ columns: cols }).eq('id', activeTable.id)
    const updated = { ...activeTable, columns: cols }
    setActiveTable(updated)
    setTables(ts => ts.map(t => t.id === activeTable.id ? updated : t))
    setShowAddColumn(false)
  }

  const deleteColumn = async (colId) => {
    const cols = (activeTable.columns || []).filter(c => c.id !== colId)
    await supabase.from('db_tables').update({ columns: cols }).eq('id', activeTable.id)
    const updated = { ...activeTable, columns: cols }
    setActiveTable(updated)
    setTables(ts => ts.map(t => t.id === activeTable.id ? updated : t))
    setContextMenu(null)
  }

  const renameColumn = async (colId, newName) => {
    const cols = (activeTable.columns || []).map(c => c.id === colId ? { ...c, name: newName } : c)
    await supabase.from('db_tables').update({ columns: cols }).eq('id', activeTable.id)
    const updated = { ...activeTable, columns: cols }
    setActiveTable(updated)
    setTables(ts => ts.map(t => t.id === activeTable.id ? updated : t))
    setRenamingCol(null)
    setContextMenu(null)
  }

  const columns = activeTable?.columns || []

  return (
    <div style={{ padding: '32px 40px', height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>Database</h1>
        <button onClick={() => setShowNewTable(true)} style={{
          display: 'flex', alignItems: 'center', gap: 5, marginLeft: 'auto',
          padding: '7px 14px', fontSize: 13, fontWeight: 500,
          border: '1px solid var(--color-hairline)', borderRadius: 9999,
          background: 'var(--color-surface)', color: 'var(--color-ink)', cursor: 'pointer',
        }}>
          <Plus size={13} /> New table
        </button>
      </div>

      {/* Table tabs */}
      {tables.length > 0 && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap', background: 'var(--color-canvas-soft)', borderRadius: 8, padding: 4, width: 'fit-content' }}>
          {tables.map(t => (
            <button key={t.id} onClick={() => setActiveTable(t)} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 14px', fontSize: 13, fontWeight: 500, borderRadius: 6,
              background: activeTable?.id === t.id ? 'var(--color-surface)' : 'transparent',
              color: activeTable?.id === t.id ? 'var(--color-ink)' : 'var(--color-ink-muted)',
              border: activeTable?.id === t.id ? '1px solid var(--color-hairline)' : '1px solid transparent',
              cursor: 'pointer', boxShadow: activeTable?.id === t.id ? 'var(--shadow-soft)' : 'none',
            }}>
              <Table2 size={12} /> {t.name}
            </button>
          ))}
        </div>
      )}

      {/* New table input */}
      {showNewTable && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input value={newTableName} onChange={e => setNewTableName(e.target.value)}
            placeholder="Table name" autoFocus
            onKeyDown={e => e.key === 'Enter' && createTable()}
            style={{ padding: '8px 12px', fontSize: 14, border: '1px solid var(--color-hairline)', borderRadius: 8, outline: 'none', background: 'var(--color-surface)', color: 'var(--color-ink)', maxWidth: 240 }} />
          <button onClick={createTable} style={{ padding: '8px 16px', fontSize: 14, fontWeight: 500, background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 9999, cursor: 'pointer' }}>Create</button>
          <button onClick={() => setShowNewTable(false)} style={{ padding: '8px 14px', fontSize: 14, border: '1px solid var(--color-hairline)', borderRadius: 9999, background: 'transparent', cursor: 'pointer' }}>Cancel</button>
        </div>
      )}

      {loading ? (
        <div style={{ color: 'var(--color-ink-faint)', padding: 40, textAlign: 'center' }}>Loading…</div>
      ) : !activeTable ? (
        <div style={{ textAlign: 'center', padding: 64, color: 'var(--color-ink-faint)' }}>
          <Table2 size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p style={{ marginBottom: 16 }}>No tables yet. Create your first database table!</p>
          <button onClick={() => setShowNewTable(true)} style={{ padding: '9px 20px', fontSize: 14, fontWeight: 500, background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 9999, cursor: 'pointer' }}>
            Create table
          </button>
        </div>
      ) : (
        <div style={{ flex: 1, overflow: 'auto', border: '1px solid var(--color-hairline)', borderRadius: 10 }}>
          <table style={{ minWidth: 600, width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-canvas-soft)', borderBottom: '1px solid var(--color-hairline)' }}>
                <th style={{ width: 36, padding: '10px 12px', fontSize: 12, color: 'var(--color-ink-faint)', fontWeight: 500, textAlign: 'left' }}>#</th>
                {columns.map(col => (
                  <th key={col.id} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', whiteSpace: 'nowrap' }}
                    onContextMenu={e => {
                      e.preventDefault()
                      setContextMenu({ col, x: e.clientX, y: e.clientY })
                    }}>
                    {renamingCol === col.id ? (
                      <input
                        autoFocus
                        value={renameVal}
                        onChange={e => setRenameVal(e.target.value)}
                        onBlur={() => renameVal.trim() && renameColumn(col.id, renameVal)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') renameColumn(col.id, renameVal)
                          if (e.key === 'Escape') { setRenamingCol(null); setContextMenu(null) }
                        }}
                        style={{ padding: '2px 6px', fontSize: 13, border: '1px solid var(--color-primary)', borderRadius: 4, outline: 'none', width: 100 }}
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: 'var(--color-ink-faint)' }}>{getTypeIcon(col.type)}</span>
                        {col.name}
                      </div>
                    )}
                  </th>
                ))}
                <th style={{ padding: '10px 14px', position: 'relative' }}>
                  <button onClick={() => setShowAddColumn(p => !p)} style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    color: 'var(--color-ink-faint)', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    padding: '3px 8px', borderRadius: 6, border: '1px dashed var(--color-hairline)',
                    background: 'transparent', whiteSpace: 'nowrap',
                  }}>
                    <Plus size={12} /> Add column
                  </button>
                  {showAddColumn && <AddColumnPanel onAdd={addColumn} onClose={() => setShowAddColumn(false)} />}
                </th>
                <th style={{ width: 32 }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id} style={{ borderBottom: '1px solid var(--color-hairline)', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-canvas-soft)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '8px 12px', color: 'var(--color-ink-faint)', fontSize: 12 }}>{i + 1}</td>
                  {columns.map(col => (
                    <td key={col.id} style={{ padding: '8px 14px', position: 'relative', cursor: 'pointer', minWidth: 120 }}
                      onClick={() => setEditingCell(`${row.id}-${col.id}`)}>
                      {editingCell === `${row.id}-${col.id}` ? (
                        <CellEditor value={row.data[col.id]} col={col}
                          onSave={val => updateCell(row.id, col.id, val)}
                          onClose={() => setEditingCell(null)} />
                      ) : (
                        <CellDisplay value={row.data[col.id]} col={col} />
                      )}
                    </td>
                  ))}
                  <td />
                  <td style={{ padding: '8px 8px' }}>
                    <button onClick={() => deleteRow(row.id)} style={{
                      padding: 4, borderRadius: 4, display: 'flex',
                      color: 'var(--color-ink-faint)', cursor: 'pointer', opacity: 0,
                      transition: 'opacity 0.1s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 1}
                      onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                      <X size={13} />
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={columns.length + 3} style={{ padding: '8px 12px' }}>
                  <button onClick={addRow} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    color: 'var(--color-ink-faint)', fontSize: 13, cursor: 'pointer', padding: '4px 0',
                  }}>
                    <Plus size={14} /> Add row
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Column context menu */}
      {contextMenu && (
        <ColumnContextMenu
          x={contextMenu.x} y={contextMenu.y} col={contextMenu.col}
          onDelete={() => deleteColumn(contextMenu.col.id)}
          onRename={() => {
            setRenamingCol(contextMenu.col.id)
            setRenameVal(contextMenu.col.name)
            setContextMenu(null)
          }}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  )
}
