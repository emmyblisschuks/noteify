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
    <>
      <style>{`
        .crm-wrap { padding: 32px 40px; max-width: 1200px; margin: 0 auto; }
        .crm-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
        .crm-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
        .crm-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .crm-pipeline { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; overflow-x: auto; }
        .modal-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 768px) {
          .crm-wrap { padding: 20px 16px; }
          .crm-stats { grid-template-columns: 1fr 1fr; }
          .crm-pipeline { grid-template-columns: repeat(3, minmax(150px, 1fr)); }
          .modal-form-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .crm-stats { grid-template-columns: 1fr 1fr; }
          .crm-pipeline { grid-template-columns: repeat(2, minmax(150px, 1fr)); }
        }
      `}</style>

      <div className="crm-wrap">
        {/* Header */}
        <div className="crm-header">
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
        <div className="crm-stats">
          {[
            { label: 'Contacts', value: contacts.length, icon: <User size={18} />, color: '#62aef0', bg: '#eff6ff' },
            { label: 'Companies', value: companies.length, icon: <Building2 size={18} />, color: '#d6b6f6', bg: '#faf5ff' },
            { label: 'Pipeline', value: `₦${totalPipeline.toLocaleString()}`, icon: <TrendingUp size={18} />, color: '#dd5b00', bg: '#fff7ed' },
            { label: 'Won', value: `₦${wonValue.toLocaleString()}`, icon: <Trophy size={18} />, color: '#1aae39', bg: '#f0fdf4' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-hairline)', borderRadius: 12, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {s.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--color-canvas-soft)', borderRadius: 8, padding: 4, width: 'fit-content' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', fontSize: 13, fontWeight: 500, borderRadius: 6,
              background: tab === t.id ? 'var(--color-surface)' : 'transparent',
              color: tab === t.id ? 'var(--color-ink)' : 'var(--color-ink-muted)',
              border: tab === t.id ? '1px solid var(--color-hairline)' : '1px solid transparent',
              cursor: 'pointer', boxShadow: tab === t.id ? 'var(--shadow-soft)' : 'none', transition: 'all 0.15s',
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
              <div className="crm-pipeline">
                {STAGES.map(stage => {
                  const cfg = STAGE_CONFIG[stage]
                  const stageDeals = deals.filter(d => d.stage === stage)
                  const total = stageDeals.reduce((s, d) => s + (d.value || 0), 0)
                  return (
                    <div key={stage} style={{ minWidth: 150 }}>
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, color: cfg.color, textTransform: 'uppercase' }}>{cfg.label}</span>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-ink-faint)', background: 'var(--color-canvas-soft)', padding: '1px 6px', borderRadius: 9999 }}>{stageDeals.length}</span>
                        </div>
                        {total > 0 && <div style={{ fontSize: 11, color: 'var(--color-ink-muted)', fontWeight: 500 }}>₦{total.toLocaleString()}</div>}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {stageDeals.map(deal => {
                          const contact = contacts.find(c => c.id === deal.contact_id)
                          const company = companies.find(c => c.id === deal.company_id)
                          return (
                            <div key={deal.id} onClick={() => setModal({ type: 'deal', ...deal })}
                              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-hairline)', borderRadius: 10, padding: '10px 12px', cursor: 'pointer', borderLeft: `3px solid ${cfg.color}`, transition: 'box-shadow 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-soft)'}
                              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                              <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4, lineHeight: 1.3 }}>{deal.title}</div>
                              {deal.value > 0 && <div style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600, marginBottom: 4 }}>₦{deal.value.toLocaleString()}</div>}
                              {(contact || company) && <div style={{ fontSize: 11, color: 'var(--color-ink-muted)' }}>{contact?.full_name || company?.name}</div>}
                              {deal.close_date && <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--color-ink-faint)', marginTop: 4 }}><Calendar size={9} /> {deal.close_date}</div>}
                            </div>
                          )
                        })}
                        {stageDeals.length === 0 && (
                          <div style={{ padding: '16px 0', textAlign: 'center', fontSize: 11, color: 'var(--color-ink-faint)', borderRadius: 8, border: '1px dashed var(--color-hairline)' }}>No deals</div>
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
                  <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-ink-faint)', fontSize: 14 }}>No contacts yet. Add your first one!</div>
                ) : (
                  <div className="crm-table-wrap">
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-hairline)', background: 'var(--color-canvas-soft)' }}>
                          {['Name', 'Email', 'Phone', 'Role', 'Company'].map(h => (
                            <th key={h} style={{ padding: '10px 16px', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-muted)', textAlign: 'left', letterSpacing: 0.3, whiteSpace: 'nowrap' }}>{h}</th>
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
                                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                                  {c.full_name[0].toUpperCase()}
                                </div>
                                <span style={{ fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap' }}>{c.full_name}</span>
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-ink-muted)', whiteSpace: 'nowrap' }}>{c.email || '—'}</td>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-ink-muted)', whiteSpace: 'nowrap' }}>{c.phone || '—'}</td>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-ink-muted)', whiteSpace: 'nowrap' }}>{c.role || '—'}</td>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-ink-muted)', whiteSpace: 'nowrap' }}>{companies.find(co => co.id === c.company_id)?.name || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* COMPANIES */}
            {tab === 'companies' && (
              <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-hairline)', borderRadius: 12, overflow: 'hidden' }}>
                {companies.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-ink-faint)', fontSize: 14 }}>No companies yet. Add your first one!</div>
                ) : (
                  <div className="crm-table-wrap">
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-hairline)', background: 'var(--color-canvas-soft)' }}>
                          {['Company', 'Industry', 'Website', 'Phone', 'Contacts'].map(h => (
                            <th key={h} style={{ padding: '10px 16px', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-muted)', textAlign: 'left', letterSpacing: 0.3, whiteSpace: 'nowrap' }}>{h}</th>
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
                                <div style={{ width: 30, height: 30, borderRadius: 8, background: '#f3eeff', color: '#d6b6f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <Building2 size={14} />
                                </div>
                                <span style={{ fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap' }}>{c.name}</span>
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-ink-muted)', whiteSpace: 'nowrap' }}>{c.industry || '—'}</td>
                            <td style={{ padding: '12px 16px', fontSize: 13, whiteSpace: 'nowrap' }}>
                              {c.website ? <a href={c.website} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>{c.website.replace('https://', '')}</a> : '—'}
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-ink-muted)', whiteSpace: 'nowrap' }}>{c.phone || '—'}</td>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-ink-muted)' }}>{contacts.filter(ct => ct.company_id === c.id).length}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Modals */}
        {modal?.type === 'contact' && <ContactModal contact={modal.new ? null : modal} onSave={fetchAll} onClose={() => setModal(null)} workspaceId={workspace?.id} userId={user?.id} companies={companies} />}
        {modal?.type === 'deal' && <DealModal deal={modal.new ? null : modal} onSave={fetchAll} onClose={() => setModal(null)} workspaceId={workspace?.id} userId={user?.id} contacts={contacts} companies={companies} />}
        {modal?.type === 'company' && <CompanyModal company={modal.new ? null : modal} onSave={fetchAll} onClose={() => setModal(null)} workspaceId={workspace?.id} userId={user?.id} />}
      </div>
    </>
  )
}
