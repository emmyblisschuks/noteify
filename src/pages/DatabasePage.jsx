// src/pages/DatabasePage.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Plus, X, Table2 } from 'lucide-react'

export default function DatabasePage() {
  const { user, workspace } = useAuth()
  const [tables, setTables] = useState([])
  const [activeTable, setActiveTable] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTableName, setNewTableName] = useState('')
  const [showNewTable, setShowNewTable] = useState(false)
  const [editingCell, setEditingCell] = useState(null)

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
    const defaultCols = [{ id: '1', name: 'Name', type: 'text' }, { id: '2', name: 'Notes', type: 'text' }, { id: '3', name: 'Status', type: 'text' }]
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

  const addColumn = async () => {
    const name = prompt('Column name?')
    if (!name) return
    const cols = [...(activeTable.columns || []), { id: Date.now().toString(), name, type: 'text' }]
    await supabase.from('db_tables').update({ columns: cols }).eq('id', activeTable.id)
    setActiveTable(t => ({ ...t, columns: cols }))
    setTables(ts => ts.map(t => t.id === activeTable.id ? { ...t, columns: cols } : t))
  }

  const columns = activeTable?.columns || []

  return (
    <div style={{ padding: '32px 40px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>Database</h1>
        <button className="btn-utility" onClick={() => setShowNewTable(true)} style={{ gap: 4, marginLeft: 'auto' }}><Plus size={13} /> New table</button>
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

      {loading ? <div style={{ color: 'var(--color-ink-faint)' }}>Loading…</div> : !activeTable ? (
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
                {columns.map(col => <th key={col.id}>{col.name}</th>)}
                <th>
                  <button onClick={addColumn} style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--color-ink-faint)', fontSize: 12 }}>
                    <Plus size={12} /> Add column
                  </button>
                </th>
                <th style={{ width: 32 }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id}>
                  <td style={{ color: 'var(--color-ink-faint)', fontSize: 12 }}>{i + 1}</td>
                  {columns.map(col => (
                    <td key={col.id} onClick={() => setEditingCell(`${row.id}-${col.id}`)}>
                      {editingCell === `${row.id}-${col.id}` ? (
                        <input className="input" defaultValue={row.data[col.id] || ''}
                          autoFocus style={{ border: 'none', padding: '2px 4px', background: 'transparent' }}
                          onBlur={e => { updateCell(row.id, col.id, e.target.value); setEditingCell(null) }}
                          onKeyDown={e => e.key === 'Enter' && e.target.blur()} />
                      ) : (
                        <span>{row.data[col.id] || <span style={{ color: 'var(--color-ink-faint)', fontSize: 12 }}>Empty</span>}</span>
                      )}
                    </td>
                  ))}
                  <td />
                  <td>
                    <button onClick={() => deleteRow(row.id)} style={{ color: 'var(--color-ink-faint)', display: 'flex' }}><X size={13} /></button>
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
