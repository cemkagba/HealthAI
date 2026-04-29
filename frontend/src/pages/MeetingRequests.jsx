import { useState, useEffect, useCallback } from 'react'
import client from '../api/client'
import { StatusBadge, RoleBadge } from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { Spinner } from '../components/ui/Spinner'
import { format, formatDistanceToNow } from 'date-fns'

export default function MeetingRequests() {
  const [tab, setTab] = useState('received')
  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="page-title">Meeting Requests</h2>
        <p className="text-slate-500 text-sm mt-0.5">Manage incoming and outgoing collaboration requests.</p>
      </div>
      <div className="flex gap-1 bg-zinc-900 border border-zinc-700 rounded-xl p-1 w-fit">
        {['received','sent'].map(t => (
          <button key={t} onClick={() => setTab(t)} id={`tab-${t}`}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab===t ? 'bg-zinc-700 text-slate-100 shadow' : 'text-slate-500 hover:text-slate-300'}`}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>
      {tab==='received' ? <ReceivedTab /> : <SentTab />}
    </div>
  )
}

function ReceivedTab() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)
  const [accepting, setAccepting] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try { const { data } = await client.get('/meetings/received'); setRequests(data) }
    catch { setRequests([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const reject = async id => {
    if (!confirm('Reject this meeting request?')) return
    try { await client.patch(`/meetings/${id}/reject`); fetch() }
    catch (err) { alert(err.response?.data?.error ?? 'Failed') }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>
  if (requests.length === 0) return <Empty label="No meeting requests received yet." />

  return (
    <div className="space-y-4">
      {requests.map(r => (
        <div key={r.id} className="card p-5 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs text-slate-500 mb-1">Request for</p>
              <p className="font-semibold text-slate-100">{r.post_title}</p>
            </div>
            <StatusBadge status={r.status} />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-600 to-indigo-700 flex items-center justify-center text-xs font-bold text-white">{r.requester_name?.[0]}</div>
              <div>
                <p className="font-medium text-slate-200 text-sm">{r.requester_name}</p>
                <p className="text-xs text-slate-500">{r.requester_institution}</p>
              </div>
            </div>
            <RoleBadge role={r.requester_role} />
          </div>

          {r.message && (
            <div className="bg-slate-800/60 rounded-lg px-3 py-2 text-sm text-slate-300 border border-slate-700/50">
              <p className="text-xs text-slate-500 mb-1">Message</p>
              {r.message}
            </div>
          )}

          <div>
            <p className="text-xs text-slate-500 mb-2">Proposed time slots</p>
            <div className="flex flex-wrap gap-2">
              {(r.proposed_slots || []).map((slot, i) => (
                <span key={i} className="text-xs bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-slate-300 font-mono">
                  {format(new Date(slot), 'dd MMM yyyy, HH:mm')}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className={`w-1.5 h-1.5 rounded-full ${r.nda_accepted ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            NDA {r.nda_accepted ? 'accepted by requester' : 'NOT accepted'}
            <span className="ml-auto">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span>
          </div>

          {r.status === 'pending' && (
            <AcceptSlotWidget requestId={r.id} slots={r.proposed_slots} onDone={fetch} onReject={() => reject(r.id)} />
          )}
          {r.status === 'accepted' && r.accepted_slot && (
            <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-lg px-3 py-2 text-sm text-emerald-300">
              ✅ Accepted slot: <strong>{format(new Date(r.accepted_slot), 'dd MMM yyyy, HH:mm')}</strong>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function AcceptSlotWidget({ requestId, slots, onDone, onReject }) {
  const [selected, setSelected] = useState('')
  const [loading, setLoading]   = useState(false)
  const accept = async () => {
    if (!selected) return
    setLoading(true)
    try { await client.patch(`/meetings/${requestId}/accept`, { accepted_slot: selected }); onDone() }
    catch (err) { alert(err.response?.data?.error ?? 'Failed') }
    finally { setLoading(false) }
  }
  return (
    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-700">
      <select className="input flex-1 min-w-[180px] text-xs" value={selected} onChange={e => setSelected(e.target.value)} id={`accept-slot-${requestId}`}>
        <option value="">Select a slot to accept…</option>
        {(slots || []).map((s, i) => <option key={i} value={s}>{format(new Date(s), 'dd MMM yyyy, HH:mm')}</option>)}
      </select>
      <button onClick={accept} disabled={!selected || loading} className="btn-primary text-xs px-3 py-1.5 disabled:opacity-40">
        {loading ? <Spinner size="sm" /> : '✓ Accept'}
      </button>
      <button onClick={onReject} className="btn-danger text-xs px-3 py-1.5">✕ Reject</button>
    </div>
  )
}

function SentTab() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    client.get('/meetings/sent')
      .then(r => setRequests(r.data))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>
  if (requests.length === 0) return <Empty label="You haven't sent any meeting requests yet." />

  return (
    <div className="space-y-4">
      {requests.map(r => (
        <div key={r.id} className="card p-5 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs text-slate-500 mb-1">Post</p>
              <p className="font-semibold text-slate-100">{r.post_title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{r.post_owner_name} · {r.post_owner_institution}</p>
            </div>
            <StatusBadge status={r.status} />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1.5">Your proposed slots</p>
            <div className="flex flex-wrap gap-2">
              {(r.proposed_slots || []).map((slot, i) => (
                <span key={i} className={`text-xs rounded-lg px-3 py-1.5 font-mono border ${r.accepted_slot === slot ? 'bg-emerald-900/30 border-emerald-700/50 text-emerald-300' : 'bg-slate-800 border-slate-600 text-slate-300'}`}>
                  {format(new Date(slot), 'dd MMM yyyy, HH:mm')}
                  {r.accepted_slot === slot && ' ✓'}
                </span>
              ))}
            </div>
          </div>
          {r.status === 'accepted' && r.accepted_slot && (
            <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-lg px-3 py-2 text-sm text-emerald-300">
              🎉 Meeting confirmed: <strong>{format(new Date(r.accepted_slot), 'dd MMM yyyy, HH:mm')}</strong> — Join via your agreed video platform (Zoom/Teams).
            </div>
          )}
          <p className="text-xs text-slate-600">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</p>
        </div>
      ))}
    </div>
  )
}

function Empty({ label }) {
  return (
    <div className="text-center py-16 text-slate-500">
      <p className="text-4xl mb-3">📭</p>
      <p className="font-medium">{label}</p>
    </div>
  )
}
