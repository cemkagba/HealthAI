import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import client from '../api/client'
import { StatusBadge, DomainBadge } from '../components/ui/Badge'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import { formatDistanceToNow, differenceInDays } from 'date-fns'
import { Timer, Calendar, RefreshCw, FileText } from 'lucide-react'

const STATUSES = ['draft','active','meeting_scheduled','partner_found','expired']

// ── Expiry helpers ─────────────────────────────────────────────────────────────
function getExpiryInfo(expires_at) {
  if (!expires_at) return null
  const daysLeft = differenceInDays(new Date(expires_at), new Date())
  if (daysLeft < 0) return { daysLeft: 0, label: 'Expired', color: 'text-slate-500', bg: 'bg-slate-500/10 border-slate-500/20', pulse: false }
  if (daysLeft < 5)  return { daysLeft, label: `${daysLeft}d left`, color: 'text-rose-400',  bg: 'bg-rose-500/10 border-rose-500/20',  pulse: true  }
  if (daysLeft < 10) return { daysLeft, label: `${daysLeft}d left`, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', pulse: false }
  return { daysLeft, label: `${daysLeft}d left`, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', pulse: false }
}

export default function MyPosts() {
const [posts, setPosts]           = useState([])
  const [pagination, setPagination] = useState({ total:0, totalPages:1 })
  const [loading, setLoading]       = useState(true)
  const [page, setPage]             = useState(1)
  const [statusChanging, setStatusChanging]     = useState(null)
  const [expiryUpdating, setExpiryUpdating]     = useState(null)
  const [expiryInputs, setExpiryInputs]         = useState({})

  const fetchMine = useCallback(async pg => {
    setLoading(true)
    try {
      const { data } = await client.get('/posts/mine', { params: { page: pg, limit: 20 } })
      setPosts(data.posts)
      setPagination(data.pagination)
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMine(page) }, [page, fetchMine])

  const changeStatus = async (postId, status) => {
    setStatusChanging(postId)
    try {
      const { data } = await client.patch(`/posts/${postId}/status`, { status })
      setPosts(ps => ps.map(p => p.id === postId ? { ...p, status: data.status } : p))
      toast.success('Status updated successfully.')
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Failed to update status.')
    } finally {
      setStatusChanging(null)
    }
  }

  const updateExpiry = async (postId) => {
    const days = parseInt(expiryInputs[postId])
    if (!days || days < 20 || days > 90) {
      toast.error('Duration must be between 20 and 90 days.')
      return
    }
    setExpiryUpdating(postId)
    try {
      const { data } = await client.patch(`/posts/${postId}/expiry`, { duration_days: days })
      setPosts(ps => ps.map(p => p.id === postId ? { ...p, expires_at: data.expires_at } : p))
      setExpiryInputs(prev => ({ ...prev, [postId]: '' }))
      toast.success('Expiry date updated.')
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Failed to update expiry.')
    } finally {
      setExpiryUpdating(null)
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">My Posts</h2>
          <p className="text-slate-500 text-sm mt-0.5">{pagination.total} post{pagination.total !== 1 ? 's' : ''} total</p>
        </div>
        <Link to="/posts/create" className="btn-primary">+ New Post</Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState 
          icon={FileText} 
          title="No Posts Yet" 
          description="Share your first research idea to find collaborators." 
          action={<Link to="/posts/create" className="btn-primary mt-2">Create your first post</Link>}
        />
      ) : (
        <div className="space-y-3">
          {posts.map(post => {
            const expiry = getExpiryInfo(post.expires_at)
            return (
              <div key={post.id} className="card p-4 hover:border-sky-500/50 hover:bg-slate-800/80 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Left: post info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 flex-wrap">
                      <Link to={`/posts/${post.id}`} className="font-semibold text-slate-200 hover:text-sky-400 transition-colors">
                        {post.title}
                      </Link>
                      <StatusBadge status={post.status} />
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <DomainBadge domain={post.domain} />
                      <span className="text-xs text-slate-500">📍 {post.city} · {post.stage}</span>
                      <span className="text-xs text-slate-600">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                    </div>

                    {/* Expiry indicator */}
                    {expiry && (
                      <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${expiry.bg}`}>
                        <Timer size={12} className={`${expiry.color} ${expiry.pulse ? 'animate-pulse' : ''}`} />
                        <span className={`text-xs font-semibold ${expiry.color}`}>{expiry.label}</span>
                        {post.expires_at && (
                          <span className="text-xs text-slate-500 ml-1">
                            (expires {new Date(post.expires_at).toLocaleDateString('tr-TR')})
                          </span>
                        )}
                      </div>
                    )}

                    {/* Expiry extend input — only for active posts */}
                    {post.status === 'active' && (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-slate-800/60 border border-white/5 rounded-xl px-3 py-1.5">
                          <Calendar size={13} className="text-slate-500" />
                          <input
                            type="number"
                            min={20}
                            max={90}
                            placeholder="Days (20–90)"
                            value={expiryInputs[post.id] || ''}
                            onChange={e => setExpiryInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                            className="bg-transparent text-xs text-slate-300 placeholder-slate-600 w-28 outline-none"
                          />
                        </div>
                        <button
                          onClick={() => updateExpiry(post.id)}
                          disabled={expiryUpdating === post.id || !expiryInputs[post.id]}
                          className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40 flex items-center gap-1"
                        >
                          <RefreshCw size={12} className={expiryUpdating === post.id ? 'animate-spin' : ''} />
                          Extend
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right: actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link to={`/posts/${post.id}/edit`} className="btn-ghost text-xs px-3 py-1.5">Edit</Link>
                    <select
                      className="input text-xs py-1.5 px-2 w-auto"
                      value=""
                      disabled={statusChanging === post.id}
                      onChange={e => e.target.value && changeStatus(post.id, e.target.value)}
                    >
                      <option value="">Change status…</option>
                      {STATUSES.filter(s => s !== post.status).map(s => (
                        <option key={s} value={s}>{s.replace(/_/g,' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page<=1} onClick={() => setPage(p=>p-1)} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-30">← Prev</button>
          <span className="text-sm text-slate-400 flex items-center">{page} / {pagination.totalPages}</span>
          <button disabled={page>=pagination.totalPages} onClick={() => setPage(p=>p+1)} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-30">Next →</button>
        </div>
      )}
    </div>
  )
}
