import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import client from '../api/client'
import { StatusBadge, RoleBadge } from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import { format, formatDistanceToNow } from 'date-fns'
import { CalendarHeart, CheckCircle, XCircle } from 'lucide-react'

function MeetingStatusBadge({ status }) {
  const colors = {
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    accepted: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    rejected: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    cancelled: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  }
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${colors[status] || colors.pending}`}>
      {status}
    </span>
  )
}

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
    try { 
      await client.patch(`/meetings/${id}/reject`); 
      fetch();
      toast.info('Request rejected.')
    }
    catch (err) { toast.error(err.response?.data?.error ?? 'Failed to reject request.') }
  }

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}</div>
  if (requests.length === 0) return <EmptyState icon={CalendarHeart} title="No Received Requests" description="You haven't received any meeting requests yet." />

  return (
    <div className="space-y-4">
      {requests.map(r => (
        <div key={r.id} className="card p-6 md:p-8 space-y-6 hover:border-sky-500/50 hover:bg-slate-800/80 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/5 pb-4">
            <div>
              <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Request for</p>
              <p className="font-semibold text-slate-100 text-lg">{r.post_title}</p>
            </div>
            <MeetingStatusBadge status={r.status} />
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

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className={`w-2 h-2 rounded-full ${r.nda_accepted ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            NDA {r.nda_accepted ? 'accepted by requester' : 'NOT accepted'}
            <span className="ml-auto flex items-center gap-1.5"><CalendarHeart size={14} className="text-slate-500"/> {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span>
          </div>

          {r.status === 'pending' && (
            <AcceptSlotWidget requestId={r.id} slots={r.proposed_slots} onDone={fetch} onReject={() => reject(r.id)} />
          )}
          {r.status === 'accepted' && r.accepted_slot && (
            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-4 text-emerald-300 flex items-center gap-3">
              <CheckCircle size={24} className="text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold mb-0.5">Meeting Confirmed</p>
                <p className="text-xs text-emerald-300/80">Scheduled for {format(new Date(r.accepted_slot), 'dd MMM yyyy, HH:mm')}</p>
              </div>
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
    try { 
      await client.patch(`/meetings/${requestId}/accept`, { accepted_slot: selected }); 
      onDone();
      toast.success('Meeting request accepted!');
    }
    catch (err) { toast.error(err.response?.data?.error ?? 'Failed to accept slot.') }
    finally { setLoading(false) }
  }

  return (
    <div className="pt-4 border-t border-white/5 space-y-4">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Proposed Time Slots</p>
        <div className="flex flex-wrap gap-2">
          {(slots || []).map((s, i) => (
            <button
              key={i}
              onClick={() => setSelected(s)}
              className={`text-xs px-4 py-2 rounded-full font-mono transition-all border ${selected === s ? 'bg-sky-500/20 border-sky-500/50 text-sky-400 ring-2 ring-sky-500/30' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-500'}`}
            >
              {format(new Date(s), 'dd MMM yyyy, HH:mm')}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        <button 
          onClick={accept} 
          disabled={!selected || loading} 
          className="btn-primary text-sm px-5 py-2.5 disabled:opacity-40 flex items-center gap-2"
        >
          {loading ? <Spinner size="sm" /> : <CheckCircle size={16} />} 
          {selected ? 'Accept Selected Slot' : 'Select a Slot to Accept'}
        </button>
        <button 
          onClick={onReject} 
          className="btn-ghost text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-sm px-5 py-2.5 flex items-center gap-2"
        >
          <XCircle size={16} /> Reject Request
        </button>
      </div>
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

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}</div>
  if (requests.length === 0) return <EmptyState icon={CalendarHeart} title="No Sent Requests" description="You haven't sent any meeting requests yet." />

  return (
    <div className="space-y-4">
      {requests.map(r => (
        <div key={r.id} className="card p-6 md:p-8 space-y-6 hover:border-sky-500/50 hover:bg-slate-800/80 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/5 pb-4">
            <div>
              <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Post</p>
              <p className="font-semibold text-slate-100 text-lg">{r.post_title}</p>
              <p className="text-sm text-slate-500 mt-1">{r.post_owner_name} · {r.post_owner_institution}</p>
            </div>
            <MeetingStatusBadge status={r.status} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Your Proposed Slots</p>
            <div className="flex flex-wrap gap-2">
              {(r.proposed_slots || []).map((slot, i) => (
                <span key={i} className={`text-xs px-4 py-2 rounded-full font-mono border flex items-center gap-2 ${r.accepted_slot === slot ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 ring-2 ring-emerald-500/30' : 'bg-slate-800/80 border-slate-700 text-slate-300'}`}>
                  {format(new Date(slot), 'dd MMM yyyy, HH:mm')}
                  {r.accepted_slot === slot && <CheckCircle size={14} />}
                </span>
              ))}
            </div>
          </div>
          {r.status === 'accepted' && r.accepted_slot && (
            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-4 text-emerald-300 flex items-center gap-3">
              <CheckCircle size={24} className="text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold mb-0.5">Meeting Confirmed</p>
                <p className="text-xs text-emerald-300/80">Scheduled for {format(new Date(r.accepted_slot), 'dd MMM yyyy, HH:mm')} — Join via your agreed video platform.</p>
              </div>
            </div>
          )}
          <p className="text-xs text-slate-600 flex items-center gap-1.5"><CalendarHeart size={14} className="text-slate-500"/> {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</p>
        </div>
      ))}
    </div>
  )
}

