// src/pages/DatabasePage.jsx
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Plus, X, Table2, Type, Hash, CheckSquare, Calendar, Link, Mail, ChevronDown, List, AlignLeft } from 'lucide-react'

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

const TYPE_COLORS = {
  select: ['#e8f4ff', '#0075de', '#f3eeff', '#863bff', '#fff0fb', '#ff64c8', '#e6f7f7', '#2a9d99', '#fff8e6', '#dd5b00'],
}

function getTypeIcon(type) {
  return COLUMN_TYPES.find(t => t.type === type)?.icon || <Type size={13} />
}

// Column type picker dropdown
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

// Add column panel
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
      borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', width: 220, padding: 12,
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Add column</div>
      <input
        autoFocus
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Column name"
        onKeyDown={e => e.key === 'Enter' && name.trim() && onAdd(name, type)}
        style={{
          width: '100%', padding: '7px 10px', fontSize: 13,
          border: '1px solid var(--color-hairline)', borderRadius: 6,
          background: 'var(--color-canvas-soft)', color: 'var(--color-ink)',
          outline: 'none', boxSizing: 'border-box', marginBottom: 8,
        }}
      />
      <div style={{ position: 'relative', marginBottom: 10 }}>
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
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => name.trim() && onAdd(name, type)} disabled={!name.trim()} style={{
          flex: 1, padding: '7px 0', fontSize: 13, fontWeight: 500,
          background: 'var(--color-primary)', color: '#fff', borderRadius: 6,
          cursor: name.trim() ? 'pointer' : 'not-allowed', opacity: name.trim() ? 1 : 0.5,
        }}>Add</button>
        <button onClick={onClose} style={{ padding: '7px 10px', fontSize: 13, borderRadius: 6, border: '1px solid var(--color-hairline)', background: 'var(--color-canvas-soft)', cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  )
}

// Cell renderer by type
function CellDisplay({ value, col }) {
  if (value === undefined || value === null || value === '') {
    return <span style={{ color: 'var(--color-ink-faint)', fontSize: 12 }}>Empty</span>
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

// Cell editor by type
function CellEditor({ value, col, onSave, onClose }) {
  const [val, setVal] = useState(value ?? (col.type === 'checkbox' ? false : col.type === 'multi_select' ? [] : ''))
  const [tagInput, setTagInput] = useState('')
  const ref = useRef(null)

  useEffect(() => { ref.current?.focus?.() }, [])

  function save() { onSave(val); onClose() }

  if (col.type === 'checkbox') {
    return (
      <input type="checkbox" checked={!!val} onChange={e => { onSave(e.target.checked); onClose() }}
        style={{ width: 16, height: 16, cursor: 'pointer' }} />
    )
  }

  if (col.type === 'select') {
    const options = col.options || []
    return (
      <div style={{ minWidth: 160, background: 'var(--color-surface)', border: '1px solid var(--color-hairline)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', padding: '4px 0', position: 'absolute', zIndex: 400 }}>
        <input ref={ref} value={val} onChange={e => setVal(e.target.value)} placeholder="Type or select..."
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') onClose() }}
          style={{ width: '100%', padding: '7px 10px', fontSize: 13, border: 'none', borderBottom: '1px solid var(--color-hairline)', outline: 'none', background: 'transparent', boxSizing: 'border-box' }} />
        {options.filter(o => o.toLowerCase().includes(val?.toLowerCase() || '')).map(o => (
          <button key={o} onClick={() => { onSave(o); onClose() }} style={{
            display: 'block', width: '100%', padding: '7px 10px', textAlign: 'left', fontSize: 13, transition: 'background 0.1s',
          }}
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
            placeholder="Add option..." style={{ flex: 1, padding: '5px 8px', fontSize: 13, border: '1px solid var(--color-hairline)', borderRadius: 6, outline: 'none', background: 'var(--color-canvas-soft)' }}
            onKeyDown={e => {
              if (e.key === 'Enter' && tagInput.trim()) { setVal([...tags, tagInput.trim()]); setTagInput('') }
              if (e.key === 'Escape') { onSave(tags); onClose() }
            }} />
          <button onClick={() => { onSave(tags); onClose() }} style={{ padding: '5px 10px', fontSize: 12, background: 'var(--color-primary)', color: '#fff', borderRadius: 6, cursor: 'pointer' }}>Done</button>
        </div>
      </div>
    )
  }

  if (col.type === 'date') {
    return (
      <input ref={ref} type="date" value={val} onChange={e => setVal(e.target.value)}
        onBlur={save} onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') onClose() }}
        style={{ padding: '4px 8px', fontSize: 13, border: '1px solid var(--color-hairline)', borderRadius: 6, outline: 'none', background: 'var(--color-surface)' }} />
    )
  }

  if (col.type === 'number') {
    return (
      <input ref={ref} type="number" value={val} onChange={e => setVal(e.target.value)}
        onBlur={save} onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') onClose() }}
        style={{ width: '100%', padding: '2px 4px', fontSize: 13, border: 'none', outline: 'none', background: 'transparent' }} />
    )
  }

  return (
    <input ref={ref} value={val} onChange={e => setVal(e.target.value)}
      onBlur={save} onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') onClose() }}
      style={{ width: '100%', padding: '2px 4px', fontSize: 13, border: 'none', outline: 'none', background: 'transparent' }} />
  )
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

  useEffect(() => { if (workspace) fetchTables() }, [workspace])
  useEffect(() => { if (activeTable) fetchRows(activeTable.id) }, [activeTable])

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
    const defaultCols = [
      { id: '1', name: 'Name', type: 'text' },
      { id: '2', name: 'Notes', type: 'text' },
      { id: '3', name: 'Status', type: 'select', options: ['Todo', 'In Progress', 'Done'] },
    ]
    const { data } = await supabase.from('db_tables').insert({ page_id: null, owner_id: user.id, name: newTableName, columns: defaultCols }).select().single()
    if (data) { setTables(t => [...t, data]); setActiveTable(data); setNewTableName(''); setShowNewTable(false) }
  }

  const addRow = async () => {
    if (!activeTable) return
    const { data } = await supabase.from('db_rows').insert({ table_id: activeTable.id, owner_id: user.id, data: {}, position: rows.length }).select().single()
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

  const columns = activeTable?.columns || []

  return (
    <div style={{ padding: '32px 40px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>Database</h1>
        <button className="btn-utility" onClick={() => setShowNewTable(true)} style={{ gap: 4, marginLeft: 'auto' }}>
          <Plus size={13} /> New table
        </button>
      </div>

      {/* Table tabs */}
      {tables.length > 0 && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
          {tables.map(t => (
            <button key={t.id} onClick={() => setActiveTable(t)}
              className={activeTable?.id === t.id ? 'btn-primary' : 'btn-utility'}
              style={{ fontSize: 13, gap: 5 }}>
              <Table2 size={12} />{t.name}
            </button>
          ))}
        </div>
      )}

      {showNewTable && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input className="input" value={newTableName} onChange={e => setNewTableName(e.target.value)}
            placeholder="Table name" style={{ maxWidth: 240 }}
            onKeyDown={e => e.key === 'Enter' && createTable()} autoFocus />
          <button className="btn-primary" onClick={createTable}>Create</button>
          <button className="btn-utility" onClick={() => setShowNewTable(false)}>Cancel</button>
        </div>
      )}

      {loading ? (
        <div style={{ color: 'var(--color-ink-faint)' }}>Loading…</div>
      ) : !activeTable ? (
        <div style={{ textAlign: 'center', padding: 64, color: 'var(--color-ink-faint)' }}>
          <Table2 size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p>No tables yet. Create your first database table!</p>
          <button className="btn-primary" onClick={() => setShowNewTable(true)} style={{ marginTop: 16 }}>Create table</button>
        </div>
      ) : (
        <div style={{ flex: 1, overflow: 'auto', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-lg)' }}>
          <table className="data-table" style={{ minWidth: 600 }}>
            <thead>
              <tr>
                <th style={{ width: 32 }}>#</th>
                {columns.map(col => (
                  <th key={col.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: 'var(--color-ink-faint)' }}>{getTypeIcon(col.type)}</span>
                      {col.name}
                    </div>
                  </th>
                ))}
                <th style={{ position: 'relative' }}>
                  <button onClick={() => setShowAddColumn(p => !p)}
                    style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--color-ink-faint)', fontSize: 12 }}>
                    <Plus size={12} /> Add column
                  </button>
                  {showAddColumn && (
                    <AddColumnPanel onAdd={addColumn} onClose={() => setShowAddColumn(false)} />
                  )}
                </th>
                <th style={{ width: 32 }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id}>
                  <td style={{ color: 'var(--color-ink-faint)', fontSize: 12 }}>{i + 1}</td>
                  {columns.map(col => (
                    <td key={col.id} style={{ position: 'relative', cursor: 'pointer' }}
                      onClick={() => setEditingCell(`${row.id}-${col.id}`)}>
                      {editingCell === `${row.id}-${col.id}` ? (
                        <CellEditor
                          value={row.data[col.id]}
                          col={col}
                          onSave={val => updateCell(row.id, col.id, val)}
                          onClose={() => setEditingCell(null)}
                        />
                      ) : (
                        <CellDisplay value={row.data[col.id]} col={col} />
                      )}
                    </td>
                  ))}
                  <td />
                  <td>
                    <button onClick={() => deleteRow(row.id)} style={{ color: 'var(--color-ink-faint)', display: 'flex' }}>
                      <X size={13} />
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={columns.length + 3}>
                  <button onClick={addRow} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-ink-faint)', fontSize: 13, padding: '6px 4px' }}>
                    <Plus size={14} /> Add row
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
