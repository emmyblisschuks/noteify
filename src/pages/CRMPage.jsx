// src/pages/CRMPage.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Plus, X, User, Building2, TrendingUp, Trophy, ChevronRight, Mail, Phone, Briefcase, Calendar, DollarSign } from 'lucide-react'

const STAGES = ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost']
const STAGE_CONFIG = {
  lead:        { color: '#a39e98', bg: '#f5f5f4', label: 'Lead' },
  qualified:   { color: '#62aef0', bg: '#eff6ff', label: 'Qualified' },
  proposal:    { color: '#d6b6f6', bg: '#faf5ff', label: 'Proposal' },
  negotiation: { color: '#dd5b00', bg: '#fff7ed', label: 'Negotiation' },
  won:         { color: '#1aae39', bg: '#f0fdf4', label: 'Won' },
  lost:        { color: '#e74c3c', bg: '#fef2f2', label: 'Lost' },
}

const inputStyle = {
  width: '100%', padding: '9px 12px', fontSize: 14,
  border: '1px solid var(--color-hairline)',
  borderRadius: 6, background: 'var(--color-surface)',
  color: 'var(--color-ink)', outline: 'none', boxSizing: 'border-box',
}

const labelStyle = {
  fontSize: 12, fontWeight: 500,
  color: 'var(--color-ink-muted)',
  display: 'block', marginBottom: 5,
}

function Modal({ title, onClose, children }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--color-surface)',
        borderRadius: 14, padding: 28, width: '100%', maxWidth: 520,
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.3 }}>{title}</h3>
          <button onClick={onClose} style={{
            padding: 6, borderRadius: 6, border: '1px solid var(--color-hairline)',
            background: 'var(--color-canvas-soft)', cursor: 'pointer',
            display: 'flex', color: 'var(--color-ink-muted)',
          }}><X size={15} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

function ContactModal({ contact, onSave, onClose, workspaceId, userId, companies }) {
  const [form, setForm] = useState(contact || { full_name: '', email: '', phone: '', role: '', company_id: '', notes: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const save = async () => {
    if (!form.full_name.trim()) return
    if (contact?.id) await supabase.from('crm_contacts').update(form).eq('id', contact.id)
    else await supabase.from('crm_contacts').insert({ ...form, workspace_id: workspaceId, owner_id: userId })
    onSave(); onClose()
  }
  return (
    <Modal title={contact ? 'Edit contact' : 'New contact'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={labelStyle}>Full name *</label>
          <input style={inputStyle} value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Jane Doe" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} value={form.email || ''} onChange={e => set('email', e.target.value)} placeholder="jane@example.com" />
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input style={inputStyle} value={form.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="+234..." />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Job title</label>
            <input style={inputStyle} value={form.role || ''} onChange={e => set('role', e.target.value)} placeholder="CEO" />
          </div>
          <div>
            <label style={labelStyle}>Company</label>
            <select style={inputStyle} value={form.company_id || ''} onChange={e => set('company_id', e.target.value)}>
              <option value="">No company</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Notes</label>
          <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3} value={form.notes || ''} onChange={e => set('notes', e.target.value)} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
          <button onClick={onClose} style={{ padding: '9px 18px', fontSize: 14, borderRadius: 9999, border: '1px solid var(--color-hairline)', background: 'var(--color-canvas-soft)', cursor: 'pointer' }}>Cancel</button>
          <button onClick={save} style={{ padding: '9px 20px', fontSize: 14, fontWeight: 500, borderRadius: 9999, background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer' }}>
            {contact ? 'Save changes' : 'Create contact'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function DealModal({ deal, onSave, onClose, workspaceId, userId, contacts, companies }) {
  const [form, setForm] = useState(deal || { title: '', value: '', stage: 'lead', contact_id: '', company_id: '', notes: '', close_date: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const save = async () => {
    if (!form.title.trim()) return
    const payload = { ...form, value: parseFloat(form.value) || 0, close_date: form.close_date || null }
    if (deal?.id) await supabase.from('crm_deals').update(payload).eq('id', deal.id)
    else await supabase.from('crm_deals').insert({ ...payload, workspace_id: workspaceId, owner_id: userId })
    onSave(); onClose()
  }
  return (
    <Modal title={deal ? 'Edit deal' : 'New deal'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={labelStyle}>Deal title *</label>
          <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Acme Corp — Q4 Contract" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Value (₦)</label>
            <input type="number" style={inputStyle} value={form.value || ''} onChange={e => set('value', e.target.value)} placeholder="0" />
          </div>
          <div>
            <label style={labelStyle}>Stage</label>
            <select style={inputStyle} value={form.stage} onChange={e => set('stage', e.target.value)}>
              {STAGES.map(s => <option key={s} value={s}>{STAGE_CONFIG[s].label}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Contact</label>
            <select style={inputStyle} value={form.contact_id || ''} onChange={e => set('contact_id', e.target.value)}>
              <option value="">None</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Company</label>
            <select style={inputStyle} value={form.company_id || ''} onChange={e => set('company_id', e.target.value)}>
              <option value="">None</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Expected close date</label>
          <input type="date" style={inputStyle} value={form.close_date || ''} onChange={e => set('close_date', e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Notes</label>
          <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3} value={form.notes || ''} onChange={e => set('notes', e.target.value)} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
          <button onClick={onClose} style={{ padding: '9px 18px', fontSize: 14, borderRadius: 9999, border: '1px solid var(--color-hairline)', background: 'var(--color-canvas-soft)', cursor: 'pointer' }}>Cancel</button>
          <button onClick={save} style={{ padding: '9px 20px', fontSize: 14, fontWeight: 500, borderRadius: 9999, background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer' }}>
            {deal ? 'Save changes' : 'Create deal'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function CompanyModal({ company, onSave, onClose, workspaceId, userId }) {
  const [form, setForm] = useState(company || { name: '', industry: '', website: '', phone: '', notes: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const save = async () => {
    if (!form.name.trim()) return
    if (company?.id) await supabase.from('crm_companies').update(form).eq('id', company.id)
    else await supabase.from('crm_companies').insert({ ...form, workspace_id: workspaceId, owner_id: userId })
    onSave(); onClose()
  }
  return (
    <Modal title={company ? 'Edit company' : 'New company'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={labelStyle}>Company name *</label>
          <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Acme Corp" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Industry</label>
            <input style={inputStyle} value={form.industry || ''} onChange={e => set('industry', e.target.value)} placeholder="Technology" />
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input style={inputStyle} value={form.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="+234..." />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Website</label>
          <input style={inputStyle} value={form.website || ''} onChange={e => set('website', e.target.value)} placeholder="https://acme.com" />
        </div>
        <div>
          <label style={labelStyle}>Notes</label>
          <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3} value={form.notes || ''} onChange={e => set('notes', e.target.value)} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
          <button onClick={onClose} style={{ padding: '9px 18px', fontSize: 14, borderRadius: 9999, border: '1px solid var(--color-hairline)', background: 'var(--color-canvas-soft)', cursor: 'pointer' }}>Cancel</button>
          <button onClick={save} style={{ padding: '9px 20px', fontSize: 14, fontWeight: 500, borderRadius: 9999, background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer' }}>
            {company ? 'Save changes' : 'Create company'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function CRMPage() {
  const { user, workspace } = useAuth()
  const [tab, setTab] = useState('pipeline')
  const [contacts, setContacts] = useState([])
  const [companies, setCompanies] = useState([])
  const [deals, setDeals] = useState([])
  const [modal, setModal] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (workspace) fetchAll() }, [workspace])

  async function fetchAll() {
    setLoading(true)
    const [{ data: c }, { data: co }, { data: d }] = await Promise.all([
      supabase.from('crm_contacts').select('*').eq('workspace_id', workspace.id).order('created_at', { ascending: false }),
      supabase.from('crm_companies').select('*').eq('workspace_id', workspace.id).order('name'),
      supabase.from('crm_deals').select('*').eq('workspace_id', workspace.id).order('created_at', { ascending: false }),
    ])
    setContacts(c || [])
    setCompanies(co || [])
    setDeals(d || [])
    setLoading(false)
  }

  const totalPipeline = deals.filter(d => !['won', 'lost'].includes(d.stage)).reduce((s, d) => s + (d.value || 0), 0)
  const wonValue = deals.filter(d => d.stage === 'won').reduce((s, d) => s + (d.value || 0), 0)

  const TABS = [
    { id: 'pipeline', label: 'Pipeline', icon: <TrendingUp size={14} /> },
    { id: 'contacts', label: 'Contacts', icon: <User size={14} /> },
    { id: 'companies', label: 'Companies', icon: <Building2 size={14} /> },
  ]

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, marginBottom: 4 }}>CRM</h1>
          <p style={{ fontSize: 14, color: 'var(--color-ink-muted)' }}>Manage your contacts, companies and deals.</p>
        </div>
        <div>
          {tab === 'contacts' && <button onClick={() => setModal({ type: 'contact', new: true })} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', fontSize: 14, fontWeight: 500, background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 9999, cursor: 'pointer' }}><Plus size={15} /> New contact</button>}
          {tab === 'companies' && <button onClick={() => setModal({ type: 'company', new: true })} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', fontSize: 14, fontWeight: 500, background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 9999, cursor: 'pointer' }}><Plus size={15} /> New company</button>}
          {tab === 'pipeline' && <button onClick={() => setModal({ type: 'deal', new: true })} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', fontSize: 14, fontWeight: 500, background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 9999, cursor: 'pointer' }}><Plus size={15} /> New deal</button>}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Contacts', value: contacts.length, icon: <User size={18} />, color: '#62aef0', bg: '#eff6ff' },
          { label: 'Companies', value: companies.length, icon: <Building2 size={18} />, color: '#d6b6f6', bg: '#faf5ff' },
          { label: 'Pipeline', value: `₦${totalPipeline.toLocaleString()}`, icon: <TrendingUp size={18} />, color: '#dd5b00', bg: '#fff7ed' },
          { label: 'Won', value: `₦${wonValue.toLocaleString()}`, icon: <Trophy size={18} />, color: '#1aae39', bg: '#f0fdf4' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-hairline)', borderRadius: 12, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--color-ink-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--color-canvas-soft)', borderRadius: 8, padding: 4, width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 16px', fontSize: 14, fontWeight: 500, borderRadius: 6,
            background: tab === t.id ? 'var(--color-surface)' : 'transparent',
            color: tab === t.id ? 'var(--color-ink)' : 'var(--color-ink-muted)',
            border: tab === t.id ? '1px solid var(--color-hairline)' : '1px solid transparent',
            cursor: 'pointer',
            boxShadow: tab === t.id ? 'var(--shadow-soft)' : 'none',
            transition: 'all 0.15s',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: 'var(--color-ink-faint)', padding: 40, textAlign: 'center', fontSize: 14 }}>Loading…</div>
      ) : (
        <>
          {/* PIPELINE */}
          {tab === 'pipeline' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, overflowX: 'auto' }}>
              {STAGES.map(stage => {
                const cfg = STAGE_CONFIG[stage]
                const stageDeals = deals.filter(d => d.stage === stage)
                const total = stageDeals.reduce((s, d) => s + (d.value || 0), 0)
                return (
                  <div key={stage} style={{ minWidth: 180 }}>
                    {/* Column header */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color }} />
                          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: cfg.color, textTransform: 'uppercase' }}>{cfg.label}</span>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-ink-faint)', background: 'var(--color-canvas-soft)', padding: '1px 7px', borderRadius: 9999 }}>{stageDeals.length}</span>
                      </div>
                      {total > 0 && <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', fontWeight: 500 }}>₦{total.toLocaleString()}</div>}
                    </div>

                    {/* Deal cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {stageDeals.map(deal => {
                        const contact = contacts.find(c => c.id === deal.contact_id)
                        const company = companies.find(c => c.id === deal.company_id)
                        return (
                          <div key={deal.id} onClick={() => setModal({ type: 'deal', ...deal })}
                            style={{
                              background: 'var(--color-surface)',
                              border: '1px solid var(--color-hairline)',
                              borderRadius: 10,
                              padding: '12px 14px',
                              cursor: 'pointer',
                              borderLeft: `3px solid ${cfg.color}`,
                              transition: 'box-shadow 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-soft)'}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, lineHeight: 1.3 }}>{deal.title}</div>
                            {deal.value > 0 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--color-primary)', fontWeight: 600, marginBottom: 6 }}>
                                ₦{deal.value.toLocaleString()}
                              </div>
                            )}
                            {(contact || company) && (
                              <div style={{ fontSize: 11, color: 'var(--color-ink-muted)', marginBottom: 4 }}>
                                {contact?.full_name || company?.name}
                              </div>
                            )}
                            {deal.close_date && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--color-ink-faint)' }}>
                                <Calendar size={10} /> {deal.close_date}
                              </div>
                            )}
                          </div>
                        )
                      })}

                      {stageDeals.length === 0 && (
                        <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 12, color: 'var(--color-ink-faint)', borderRadius: 8, border: '1px dashed var(--color-hairline)' }}>
                          No deals
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* CONTACTS */}
          {tab === 'contacts' && (
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-hairline)', borderRadius: 12, overflow: 'hidden' }}>
              {contacts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-ink-faint)', fontSize: 14 }}>
                  No contacts yet. Add your first one!
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-hairline)', background: 'var(--color-canvas-soft)' }}>
                      {['Name', 'Email', 'Phone', 'Role', 'Company'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-muted)', textAlign: 'left', letterSpacing: 0.3 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((c, i) => (
                      <tr key={c.id} onClick={() => setModal({ type: 'contact', ...c })}
                        style={{ borderBottom: i < contacts.length - 1 ? '1px solid var(--color-hairline)' : 'none', cursor: 'pointer', transition: 'background 0.1s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-canvas-soft)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                              {c.full_name[0].toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 500, fontSize: 14 }}>{c.full_name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 14, color: 'var(--color-ink-muted)' }}>{c.email || '—'}</td>
                        <td style={{ padding: '12px 16px', fontSize: 14, color: 'var(--color-ink-muted)' }}>{c.phone || '—'}</td>
                        <td style={{ padding: '12px 16px', fontSize: 14, color: 'var(--color-ink-muted)' }}>{c.role || '—'}</td>
                        <td style={{ padding: '12px 16px', fontSize: 14, color: 'var(--color-ink-muted)' }}>{companies.find(co => co.id === c.company_id)?.name || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* COMPANIES */}
          {tab === 'companies' && (
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-hairline)', borderRadius: 12, overflow: 'hidden' }}>
              {companies.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-ink-faint)', fontSize: 14 }}>
                  No companies yet. Add your first one!
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-hairline)', background: 'var(--color-canvas-soft)' }}>
                      {['Company', 'Industry', 'Website', 'Phone', 'Contacts'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-muted)', textAlign: 'left', letterSpacing: 0.3 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((c, i) => (
                      <tr key={c.id} onClick={() => setModal({ type: 'company', ...c })}
                        style={{ borderBottom: i < companies.length - 1 ? '1px solid var(--color-hairline)' : 'none', cursor: 'pointer', transition: 'background 0.1s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-canvas-soft)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f3eeff', color: '#d6b6f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Building2 size={15} />
                            </div>
                            <span style={{ fontWeight: 500, fontSize: 14 }}>{c.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 14, color: 'var(--color-ink-muted)' }}>{c.industry || '—'}</td>
                        <td style={{ padding: '12px 16px', fontSize: 14 }}>
                          {c.website ? <a href={c.website} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>{c.website.replace('https://', '')}</a> : '—'}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 14, color: 'var(--color-ink-muted)' }}>{c.phone || '—'}</td>
                        <td style={{ padding: '12px 16px', fontSize: 14, color: 'var(--color-ink-muted)' }}>{contacts.filter(ct => ct.company_id === c.id).length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {modal?.type === 'contact' && (
        <ContactModal contact={modal.new ? null : modal} onSave={fetchAll} onClose={() => setModal(null)} workspaceId={workspace?.id} userId={user?.id} companies={companies} />
      )}
      {modal?.type === 'deal' && (
        <DealModal deal={modal.new ? null : modal} onSave={fetchAll} onClose={() => setModal(null)} workspaceId={workspace?.id} userId={user?.id} contacts={contacts} companies={companies} />
      )}
      {modal?.type === 'company' && (
        <CompanyModal company={modal.new ? null : modal} onSave={fetchAll} onClose={() => setModal(null)} workspaceId={workspace?.id} userId={user?.id} />
      )}
    </div>
  )
}
