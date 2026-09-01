// src/pages/CRMPage.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Plus, X, Building2, User, TrendingUp } from 'lucide-react'

const STAGES = ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost']
const STAGE_COLORS = { lead: '#a39e98', qualified: '#62aef0', proposal: '#d6b6f6', negotiation: '#dd5b00', won: '#1aae39', lost: '#e74c3c' }

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 18 }}>{contact ? 'Edit contact' : 'New contact'}</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="field"><label>Name *</label><input className="input" value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Full name" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field"><label>Email</label><input className="input" value={form.email || ''} onChange={e => set('email', e.target.value)} placeholder="email@example.com" /></div>
            <div className="field"><label>Phone</label><input className="input" value={form.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="+234..." /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field"><label>Role</label><input className="input" value={form.role || ''} onChange={e => set('role', e.target.value)} placeholder="Job title" /></div>
            <div className="field"><label>Company</label>
              <select className="input" value={form.company_id || ''} onChange={e => set('company_id', e.target.value)}>
                <option value="">No company</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="field"><label>Notes</label><textarea className="input" rows={2} value={form.notes || ''} onChange={e => set('notes', e.target.value)} /></div>
          <button className="btn-primary" onClick={save} style={{ alignSelf: 'flex-end' }}>Save</button>
        </div>
      </div>
    </div>
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 18 }}>{deal ? 'Edit deal' : 'New deal'}</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="field"><label>Deal title *</label><input className="input" value={form.title} onChange={e => set('title', e.target.value)} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field"><label>Value (₦)</label><input type="number" className="input" value={form.value || ''} onChange={e => set('value', e.target.value)} /></div>
            <div className="field"><label>Stage</label>
              <select className="input" value={form.stage} onChange={e => set('stage', e.target.value)}>
                {STAGES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field"><label>Contact</label>
              <select className="input" value={form.contact_id || ''} onChange={e => set('contact_id', e.target.value)}>
                <option value="">None</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
            </div>
            <div className="field"><label>Company</label>
              <select className="input" value={form.company_id || ''} onChange={e => set('company_id', e.target.value)}>
                <option value="">None</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="field"><label>Close date</label><input type="date" className="input" value={form.close_date || ''} onChange={e => set('close_date', e.target.value)} /></div>
          <div className="field"><label>Notes</label><textarea className="input" rows={2} value={form.notes || ''} onChange={e => set('notes', e.target.value)} /></div>
          <button className="btn-primary" onClick={save} style={{ alignSelf: 'flex-end' }}>Save deal</button>
        </div>
      </div>
    </div>
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

  const totalPipeline = deals.filter(d => !['won','lost'].includes(d.stage)).reduce((s, d) => s + (d.value || 0), 0)
  const wonValue = deals.filter(d => d.stage === 'won').reduce((s, d) => s + (d.value || 0), 0)

  return (
    <div style={{ padding: '32px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>CRM</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {tab === 'contacts' && <button className="btn-primary" onClick={() => setModal({ type: 'contact', new: true })} style={{ gap: 6 }}><Plus size={15} /> New contact</button>}
          {tab === 'companies' && <button className="btn-primary" onClick={() => setModal({ type: 'company', new: true })} style={{ gap: 6 }}><Plus size={15} /> New company</button>}
          {tab === 'pipeline' && <button className="btn-primary" onClick={() => setModal({ type: 'deal', new: true })} style={{ gap: 6 }}><Plus size={15} /> New deal</button>}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Contacts', value: contacts.length, icon: '👤' },
          { label: 'Companies', value: companies.length, icon: '🏢' },
          { label: 'Pipeline', value: `₦${totalPipeline.toLocaleString()}`, icon: '📊' },
          { label: 'Won', value: `₦${wonValue.toLocaleString()}`, icon: '🏆' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>{s.value}</div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {[['pipeline', '📊 Pipeline'], ['contacts', '👤 Contacts'], ['companies', '🏢 Companies']].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} className={tab === t ? 'btn-primary' : 'btn-utility'} style={{ fontSize: 13 }}>{l}</button>
        ))}
      </div>

      {loading ? <div style={{ color: 'var(--color-ink-faint)', padding: 24 }}>Loading…</div> : (
        <>
          {/* PIPELINE */}
          {tab === 'pipeline' && (
            <div className="pipeline-board" style={{ minHeight: 400 }}>
              {STAGES.map(stage => {
                const stageDeals = deals.filter(d => d.stage === stage)
                const total = stageDeals.reduce((s, d) => s + (d.value || 0), 0)
                return (
                  <div key={stage} className="pipeline-col">
                    <div className="pipeline-col-header">
                      <span style={{ color: STAGE_COLORS[stage] }}>{stage.toUpperCase()}</span>
                      <span style={{ fontSize: 11 }}>{stageDeals.length}</span>
                    </div>
                    {total > 0 && <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', marginBottom: 8 }}>₦{total.toLocaleString()}</div>}
                    {stageDeals.map(deal => (
                      <div key={deal.id} className="deal-card" onClick={() => setModal({ type: 'deal', ...deal })}>
                        <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>{deal.title}</div>
                        {deal.value > 0 && <div style={{ fontSize: 13, color: 'var(--color-primary)' }}>₦{deal.value?.toLocaleString()}</div>}
                        {deal.close_date && <div style={{ fontSize: 12, color: 'var(--color-ink-faint)', marginTop: 4 }}>Close: {deal.close_date}</div>}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          )}

          {/* CONTACTS */}
          {tab === 'contacts' && (
            <div>
              {contacts.length === 0 ? <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-ink-faint)' }}>No contacts yet. Add your first one!</div> : (
                <table className="data-table">
                  <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Company</th></tr></thead>
                  <tbody>
                    {contacts.map(c => (
                      <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => setModal({ type: 'contact', ...c })}>
                        <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>{c.full_name[0]}</div>
                          {c.full_name}
                        </div></td>
                        <td>{c.email || '—'}</td>
                        <td>{c.phone || '—'}</td>
                        <td>{c.role || '—'}</td>
                        <td>{companies.find(co => co.id === c.company_id)?.name || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* COMPANIES */}
          {tab === 'companies' && (
            <div>
              {companies.length === 0 ? <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-ink-faint)' }}>No companies yet.</div> : (
                <table className="data-table">
                  <thead><tr><th>Company</th><th>Industry</th><th>Website</th><th>Phone</th><th>Contacts</th></tr></thead>
                  <tbody>
                    {companies.map(c => (
                      <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => setModal({ type: 'company', ...c })}>
                        <td><strong>{c.name}</strong></td>
                        <td>{c.industry || '—'}</td>
                        <td>{c.website ? <a href={c.website} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>{c.website}</a> : '—'}</td>
                        <td>{c.phone || '—'}</td>
                        <td>{contacts.filter(ct => ct.company_id === c.id).length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      {/* MODALS */}
      {modal?.type === 'contact' && (
        <ContactModal contact={modal.new ? null : modal} onSave={fetchAll} onClose={() => setModal(null)} workspaceId={workspace?.id} userId={user?.id} companies={companies} />
      )}
      {modal?.type === 'deal' && (
        <DealModal deal={modal.new ? null : modal} onSave={fetchAll} onClose={() => setModal(null)} workspaceId={workspace?.id} userId={user?.id} contacts={contacts} companies={companies} />
      )}
      {modal?.type === 'company' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>{modal.new ? 'New company' : 'Edit company'}</h3>
              <button onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <CompanyForm company={modal.new ? null : modal} onSave={fetchAll} onClose={() => setModal(null)} workspaceId={workspace?.id} userId={user?.id} />
          </div>
        </div>
      )}
    </div>
  )
}

function CompanyForm({ company, onSave, onClose, workspaceId, userId }) {
  const [form, setForm] = useState(company || { name: '', industry: '', website: '', phone: '', address: '', notes: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const save = async () => {
    if (!form.name.trim()) return
    if (company?.id) await supabase.from('crm_companies').update(form).eq('id', company.id)
    else await supabase.from('crm_companies').insert({ ...form, workspace_id: workspaceId, owner_id: userId })
    onSave(); onClose()
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="field"><label>Company name *</label><input className="input" value={form.name} onChange={e => set('name', e.target.value)} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="field"><label>Industry</label><input className="input" value={form.industry || ''} onChange={e => set('industry', e.target.value)} /></div>
        <div className="field"><label>Phone</label><input className="input" value={form.phone || ''} onChange={e => set('phone', e.target.value)} /></div>
      </div>
      <div className="field"><label>Website</label><input className="input" value={form.website || ''} onChange={e => set('website', e.target.value)} /></div>
      <div className="field"><label>Notes</label><textarea className="input" rows={2} value={form.notes || ''} onChange={e => set('notes', e.target.value)} /></div>
      <button className="btn-primary" onClick={save} style={{ alignSelf: 'flex-end' }}>Save</button>
    </div>
  )
}
