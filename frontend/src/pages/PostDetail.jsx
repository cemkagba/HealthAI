import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'sonner'
import client from '../api/client'
import { StatusBadge, DomainBadge } from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { Spinner } from '../components/ui/Spinner'
import { formatDistanceToNow, format } from 'date-fns'

const STATUSES = ['draft','active','meeting_scheduled','partner_found','expired']

export default function PostDetail() {
  const { id } = useParams()
  const { user } = useAuth()
const navigate = useNavigate()
  const [post, setPost]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [showMeeting, setShowMeeting] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)

  useEffect(() => {
    client.get(`/posts/${id}`)
      .then(r => setPost(r.data))
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const changeStatus = async s => {
    setStatusLoading(true)
    try {
      const { data } = await client.patch(`/posts/${id}/status`, { status: s })
      setPost(data)
      toast.success('Post status updated.')
    } catch (err) { toast.error(err.response?.data?.error ?? 'Failed to update status.') }
    finally { setStatusLoading(false) }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!post)   return null

  const isOwner  = post.owner_id === user?.id
  const canRequest = !isOwner && post.status === 'active'

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={post.status} />
            <DomainBadge domain={post.domain} />
            <span className="text-xs bg-zinc-700/80 text-zinc-300 px-2.5 py-0.5 rounded-full">{post.required_expertise}</span>
            <span className="text-xs bg-zinc-700/80 text-zinc-300 px-2.5 py-0.5 rounded-full">Stage: {post.stage}</span>
            <span className="text-xs text-slate-500">📍 {post.city}</span>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {isOwner && <Link to={`/posts/${id}/edit`} className="btn-secondary text-xs px-3 py-1.5">Edit</Link>}
            {canRequest && <button onClick={() => setShowMeeting(true)} className="btn-primary text-xs px-3 py-1.5" id="request-meeting-btn">Request Meeting</button>}
          </div>
        </div>

        <h1 className="text-xl font-bold text-slate-100 mb-4">{post.title}</h1>
        <div 
          className="text-sm text-slate-300 leading-relaxed prose prose-invert max-w-none prose-p:mb-3 prose-a:text-sky-400 prose-ul:list-disc prose-ul:pl-5"
          dangerouslySetInnerHTML={{ __html: post.description }} 
        />

        <div className="mt-5 pt-4 border-t border-zinc-700 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <span className="font-medium text-slate-400">{post.owner_name}</span>
            {post.owner_institution && <span> · {post.owner_institution}</span>}
          </div>
          <span>Posted {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
        </div>
      </div>

      {/* Owner: change status */}
      {isOwner && (
        <div className="card p-4">
          <p className="text-sm font-medium text-slate-300 mb-3">Change Post Status</p>
          <div className="flex flex-wrap gap-2">
            {STATUSES.filter(s => s !== post.status).map(s => (
              <button key={s} onClick={() => changeStatus(s)} disabled={statusLoading}
                className="btn-secondary text-xs px-3 py-1.5 capitalize">
                {statusLoading ? <Spinner size="sm" /> : s.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      <MeetingModal open={showMeeting} onClose={() => setShowMeeting(false)} postId={id} postTitle={post.title} />
    </div>
  )
}

// ── NDA Meeting Request Modal ────────────────────────────────────────────────
function MeetingModal({ open, onClose, postId, postTitle }) {
const [message, setMessage]       = useState('')
  const [slots, setSlots]           = useState(['', '', ''])
  const [ndaAccepted, setNdaAccepted] = useState(false)
  const [loading, setLoading]       = useState(false)
  const [success, setSuccess]       = useState(false)

  const setSlot = i => e => setSlots(s => { const n=[...s]; n[i]=e.target.value; return n })

  const validSlots = slots.filter(s => s.trim() !== '')
  const canSubmit  = ndaAccepted && validSlots.length >= 1 && !loading

  const handleSubmit = async e => {
    e.preventDefault()
    if (!ndaAccepted) return
    setLoading(true)
    try {
      await client.post('/meetings', {
        post_id: postId,
        nda_accepted: true,
        proposed_slots: validSlots,
        message: message.trim() || undefined,
      })
      setSuccess(true)
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Failed to send request.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setMessage(''); setSlots(['','','']); setNdaAccepted(false); setSuccess(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Request a Meeting" maxWidth="max-w-xl">
      {success ? (
        <div className="text-center py-8">
          <p className="text-4xl mb-4">✅</p>
          <p className="text-lg font-semibold text-slate-100 mb-2">Request Sent!</p>
          <p className="text-sm text-slate-400 mb-6">The post owner will review your proposed time slots and respond shortly.</p>
          <button onClick={handleClose} className="btn-primary">Close</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-slate-800/80 border border-slate-600 rounded-lg p-3 text-xs text-slate-400">
            <p className="font-medium text-slate-300 mb-0.5">Requesting to collaborate on:</p>
            <p className="text-sky-400 font-semibold">{postTitle}</p>
          </div>

          <div>
            <label className="label" htmlFor="meeting-message">Introduction Message <span className="text-slate-500 font-normal">(optional)</span></label>
            <textarea id="meeting-message" className="input resize-none h-24" placeholder="Briefly describe your background and interest in this collaboration…" value={message} onChange={e => setMessage(e.target.value)} />
          </div>

          <div>
            <label className="label">Proposed Time Slots <span className="text-rose-400">*</span></label>
            <p className="text-xs text-slate-500 mb-2">Propose up to 3 time windows. At least 1 is required.</p>
            {slots.map((s, i) => (
              <div key={i} className="mb-2">
                <input id={`slot-${i}`} type="datetime-local" className="input" value={s} onChange={setSlot(i)}
                  required={i === 0} min={new Date().toISOString().slice(0,16)} />
              </div>
            ))}
          </div>

          {/* ── NDA Acceptance — CRITICAL SECTION ─────────────────────── */}
          <div className="rounded-xl border border-amber-700/50 bg-amber-900/20 p-4">
            <div className="flex items-start gap-2 mb-3">
              <span className="text-amber-400 text-lg flex-shrink-0">⚠</span>
              <div>
                <p className="text-sm font-semibold text-amber-300">Non-Disclosure Agreement Required</p>
                <p className="text-xs text-amber-400/80 mt-0.5">You must read and accept the NDA before submitting this request.</p>
              </div>
            </div>
            <div className="bg-slate-900/60 rounded-lg p-3 text-xs text-slate-300 leading-relaxed mb-4 border border-slate-700/50">
              By proceeding, you agree to keep all information shared during this meeting strictly confidential. This includes — but is not limited to — any proprietary clinical data, medical research findings, unpublished results, technical specifications, and project methodologies discussed with the post owner or their affiliated institution. You agree not to disclose, reproduce, or distribute this information to any third party without explicit written consent. Violation of this agreement may subject you to civil and/or criminal liability. Your acceptance is recorded with a timestamp in the platform's audit database.
            </div>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                id="nda-checkbox"
                type="checkbox"
                className="mt-0.5 w-4 h-4 rounded border-slate-500 bg-slate-800 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900 cursor-pointer flex-shrink-0"
                checked={ndaAccepted}
                onChange={e => setNdaAccepted(e.target.checked)}
              />
              <span className="text-xs text-slate-300 group-hover:text-slate-100 transition-colors">
                <strong className="text-slate-100">I have read, understood, and agree</strong> to the terms of this Non-Disclosure Agreement. I acknowledge that my acceptance is permanently recorded in the platform's database.
              </span>
            </label>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={handleClose} className="btn-secondary flex-1">Cancel</button>
            <button
              type="submit"
              id="meeting-submit"
              disabled={!canSubmit}
              title={!ndaAccepted ? 'You must accept the NDA to continue' : !validSlots.length ? 'Propose at least one time slot' : ''}
              className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? <><Spinner size="sm" /> Sending…</> : 'Send Meeting Request'}
            </button>
          </div>
          {!ndaAccepted && (
            <p className="text-center text-xs text-amber-500">↑ Accept the NDA above to enable the submit button</p>
          )}
        </form>
      )}
    </Modal>
  )
}
