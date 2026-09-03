// src/pages/IntegrationsPage.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Copy, Plus, Trash2, Check, Key, Webhook, Eye, EyeOff, ToggleLeft, ToggleRight } from 'lucide-react'

const EVENTS = [
  'page.created', 'page.updated', 'page.deleted',
  'task.created', 'task.updated', 'task.deleted',
  'crm.contact.created', 'crm.deal.updated',
]

function generateKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return 'ntfy_' + Array.from({ length: 40 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default function IntegrationsPage() {
  const { user, workspace } = useAuth()
  const [tab, setTab] = useState('api')

  // API Keys state
  const [apiKeys, setApiKeys] = useState([])
  const [newKeyName, setNewKeyName] = useState('')
  const [createdKey, setCreatedKey] = useState(null)
  const [loadingKey, setLoadingKey] = useState(false)
  const [copiedId, setCopiedId] = useState(null)

  // Webhooks state
  const [webhooks, setWebhooks] = useState([])
  const [showWebhookForm, setShowWebhookForm] = useState(false)
  const [webhookName, setWebhookName] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [selectedEvents, setSelectedEvents] = useState([])
  const [loadingWebhook, setLoadingWebhook] = useState(false)

  useEffect(() => {
    if (user) fetchApiKeys()
    if (workspace) fetchWebhooks()
  }, [user, workspace])

  async function fetchApiKeys() {
    const { data } = await supabase
      .from('api_keys')
      .select('id, name, key_hash, last_used_at, created_at')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
    setApiKeys(data || [])
  }

  async function fetchWebhooks() {
    const { data } = await supabase
      .from('webhooks')
      .select('*')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: false })
    setWebhooks(data || [])
  }

  async function createApiKey() {
    if (!newKeyName.trim()) return
    setLoadingKey(true)
    const rawKey = generateKey()
   const { data, error } = await supabase.from('webhooks').insert({
  workspace_id: workspace.id,
  owner_id: user.id,
  name: webhookName.trim(),
  url: webhookUrl.trim(),
  events: selectedEvents,
  active: true,
}).select().single()
    if (!error) {
      setCreatedKey(rawKey)
      setNewKeyName('')
      fetchApiKeys()
    }
    setLoadingKey(false)
  }

  async function deleteApiKey(id) {
    await supabase.from('api_keys').delete().eq('id', id)
    setApiKeys(k => k.filter(x => x.id !== id))
  }

  async function createWebhook() {
    if (!webhookName.trim() || !webhookUrl.trim() || selectedEvents.length === 0) return
    setLoadingWebhook(true)
    const { data, error } = await supabase.from('webhooks').insert({
      workspace_id: workspace.id,
      name: webhookName.trim(),
      url: webhookUrl.trim(),
      events: selectedEvents,
      active: true,
    }).select().single()
    if (!error) {
      setWebhooks(w => [data, ...w])
      setWebhookName('')
      setWebhookUrl('')
      setSelectedEvents([])
      setShowWebhookForm(false)
    }
    setLoadingWebhook(false)
  }

  async function toggleWebhook(id, active) {
    await supabase.from('webhooks').update({ active: !active }).eq('id', id)
    setWebhooks(w => w.map(x => x.id === id ? { ...x, active: !active } : x))
  }

  async function deleteWebhook(id) {
    await supabase.from('webhooks').delete().eq('id', id)
    setWebhooks(w => w.filter(x => x.id !== id))
  }

  function copyToClipboard(text, id) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function toggleEvent(event) {
    setSelectedEvents(e => e.includes(event) ? e.filter(x => x !== event) : [...e, event])
  }

  const inputStyle = {
    padding: '9px 12px', fontSize: 14,
    border: '1px solid var(--color-hairline)',
    borderRadius: 6, background: 'var(--color-surface)',
    color: 'var(--color-ink)', outline: 'none',
    width: '100%', boxSizing: 'border-box',
  }

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, marginBottom: 6 }}>Integrations</h1>
        <p style={{ fontSize: 14, color: 'var(--color-ink-muted)' }}>
          Manage your API keys and webhook endpoints.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'var(--color-canvas-soft)', borderRadius: 8, padding: 4, width: 'fit-content' }}>
        {[{ id: 'api', label: 'API Keys', icon: <Key size={14} /> }, { id: 'webhooks', label: 'Webhooks', icon: <Webhook size={14} /> }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 16px', fontSize: 14, fontWeight: 500,
            borderRadius: 6,
            background: tab === t.id ? 'var(--color-surface)' : 'transparent',
            color: tab === t.id ? 'var(--color-ink)' : 'var(--color-ink-muted)',
            border: tab === t.id ? '1px solid var(--color-hairline)' : '1px solid transparent',
            cursor: 'pointer',
            boxShadow: tab === t.id ? 'var(--shadow-soft)' : 'none',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* API KEYS TAB */}
      {tab === 'api' && (
        <div>
          {/* Create key */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-hairline)', borderRadius: 12, padding: 24, marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Create new API key</h2>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                placeholder="Key name e.g. n8n integration"
                value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createApiKey()}
              />
              <button onClick={createApiKey} disabled={loadingKey || !newKeyName.trim()} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 18px', fontSize: 14, fontWeight: 500,
                background: 'var(--color-primary)', color: '#fff',
                border: 'none', borderRadius: 9999, cursor: 'pointer',
                opacity: !newKeyName.trim() ? 0.5 : 1, whiteSpace: 'nowrap',
              }}>
                <Plus size={15} /> Generate key
              </button>
            </div>

            {/* Show newly created key */}
            {createdKey && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: '#f0fff4', border: '1px solid #bbf7d0', borderRadius: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#166534', marginBottom: 8 }}>
                  ✓ Key created — copy it now, it won't be shown again
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <code style={{ flex: 1, fontSize: 13, wordBreak: 'break-all', color: '#166534' }}>{createdKey}</code>
                  <button onClick={() => copyToClipboard(createdKey, 'new')} style={{
                    display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                    fontSize: 13, borderRadius: 6, border: '1px solid #bbf7d0',
                    background: '#fff', cursor: 'pointer', color: '#166534', whiteSpace: 'nowrap',
                  }}>
                    {copiedId === 'new' ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Keys list */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-hairline)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-hairline)' }}>
              <h2 style={{ fontSize: 16, fontWeight: 600 }}>Your API keys ({apiKeys.length})</h2>
            </div>
            {apiKeys.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-ink-faint)', fontSize: 14 }}>
                No API keys yet. Create one above.
              </div>
            ) : (
              apiKeys.map((k, i) => (
                <div key={k.id} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '14px 20px',
                  borderBottom: i < apiKeys.length - 1 ? '1px solid var(--color-hairline)' : 'none',
                }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: '#fff1e6', color: '#dd5b00', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Key size={15} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{k.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-ink-faint)', marginTop: 2 }}>
                      ntfy_••••••••••••••••••••••
                      {k.last_used_at
                        ? ` · Last used ${new Date(k.last_used_at).toLocaleDateString()}`
                        : ' · Never used'}
                      {' · Created '}{new Date(k.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <button onClick={() => deleteApiKey(k.id)} style={{
                    padding: 7, borderRadius: 6, border: '1px solid var(--color-hairline)',
                    background: 'var(--color-surface)', color: '#c0392b', cursor: 'pointer', display: 'flex',
                  }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Usage info */}
          <div style={{ marginTop: 20, padding: '16px 20px', background: 'var(--color-canvas-soft)', borderRadius: 10, border: '1px solid var(--color-hairline)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>How to use your API key</div>
            <code style={{ fontSize: 12, color: 'var(--color-ink-muted)', display: 'block', lineHeight: 1.8 }}>
              GET https://noteify-eta.vercel.app/api/v1/tasks<br />
              x-api-key: your_api_key_here
            </code>
          </div>
        </div>
      )}

      {/* WEBHOOKS TAB */}
      {tab === 'webhooks' && (
        <div>
          {/* Create webhook */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-hairline)', borderRadius: 12, padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showWebhookForm ? 20 : 0 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600 }}>Webhooks</h2>
              <button onClick={() => setShowWebhookForm(f => !f)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 16px', fontSize: 14, fontWeight: 500,
                background: showWebhookForm ? 'var(--color-canvas-soft)' : 'var(--color-primary)',
                color: showWebhookForm ? 'var(--color-ink)' : '#fff',
                border: '1px solid var(--color-hairline)',
                borderRadius: 9999, cursor: 'pointer',
              }}>
                <Plus size={15} /> {showWebhookForm ? 'Cancel' : 'Add webhook'}
              </button>
            </div>

            {showWebhookForm && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink-muted)', display: 'block', marginBottom: 6 }}>Webhook name</label>
                  <input style={inputStyle} placeholder="e.g. Zapier trigger" value={webhookName} onChange={e => setWebhookName(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink-muted)', display: 'block', marginBottom: 6 }}>Endpoint URL</label>
                  <input style={inputStyle} placeholder="https://hooks.zapier.com/..." value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink-muted)', display: 'block', marginBottom: 10 }}>Events to trigger</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {EVENTS.map(event => (
                      <button key={event} onClick={() => toggleEvent(event)} style={{
                        padding: '5px 12px', fontSize: 12, borderRadius: 9999,
                        background: selectedEvents.includes(event) ? 'var(--color-primary)' : 'var(--color-canvas-soft)',
                        color: selectedEvents.includes(event) ? '#fff' : 'var(--color-ink-muted)',
                        border: `1px solid ${selectedEvents.includes(event) ? 'var(--color-primary)' : 'var(--color-hairline)'}`,
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}>
                        {event}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={createWebhook} disabled={loadingWebhook || !webhookName.trim() || !webhookUrl.trim() || selectedEvents.length === 0}
                  style={{
                    padding: '10px 20px', fontSize: 14, fontWeight: 500,
                    background: 'var(--color-primary)', color: '#fff',
                    border: 'none', borderRadius: 9999, cursor: 'pointer',
                    opacity: (!webhookName.trim() || !webhookUrl.trim() || selectedEvents.length === 0) ? 0.5 : 1,
                    alignSelf: 'flex-start',
                  }}>
                  {loadingWebhook ? 'Creating…' : 'Create webhook'}
                </button>
              </div>
            )}
          </div>

          {/* Webhooks list */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-hairline)', borderRadius: 12, overflow: 'hidden' }}>
            {webhooks.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-ink-faint)', fontSize: 14 }}>
                No webhooks yet. Add one above to start receiving events.
              </div>
            ) : (
              webhooks.map((w, i) => (
                <div key={w.id} style={{
                  padding: '16px 20px',
                  borderBottom: i < webhooks.length - 1 ? '1px solid var(--color-hairline)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: w.active ? '#e6f7f7' : 'var(--color-canvas-soft)', color: w.active ? '#2a9d99' : 'var(--color-ink-faint)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Webhook size={15} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{w.name}</span>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999,
                          background: w.active ? '#dcfce7' : 'var(--color-canvas-soft)',
                          color: w.active ? '#166534' : 'var(--color-ink-faint)',
                        }}>
                          {w.active ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-ink-faint)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {w.url}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {w.events.map(e => (
                          <span key={e} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 9999, background: 'var(--color-canvas-soft)', color: 'var(--color-ink-muted)', border: '1px solid var(--color-hairline)' }}>
                            {e}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button onClick={() => copyToClipboard(w.url, w.id)} style={{ padding: 7, borderRadius: 6, border: '1px solid var(--color-hairline)', background: 'var(--color-surface)', cursor: 'pointer', display: 'flex', color: 'var(--color-ink-muted)' }}>
                        {copiedId === w.id ? <Check size={14} color="#166534" /> : <Copy size={14} />}
                      </button>
                      <button onClick={() => toggleWebhook(w.id, w.active)} style={{ padding: 7, borderRadius: 6, border: '1px solid var(--color-hairline)', background: 'var(--color-surface)', cursor: 'pointer', display: 'flex', color: w.active ? '#2a9d99' : 'var(--color-ink-faint)' }}>
                        {w.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      </button>
                      <button onClick={() => deleteWebhook(w.id)} style={{ padding: 7, borderRadius: 6, border: '1px solid var(--color-hairline)', background: 'var(--color-surface)', cursor: 'pointer', display: 'flex', color: '#c0392b' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
