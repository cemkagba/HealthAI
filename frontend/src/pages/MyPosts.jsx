import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { StatusBadge, DomainBadge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { formatDistanceToNow } from 'date-fns'

const STATUSES = ['draft','active','meeting_scheduled','partner_found','expired']

export default function MyPosts() {
  const [posts, setPosts]         = useState([])
  const [pagination, setPagination] = useState({ total:0, totalPages:1 })
  const [loading, setLoading]     = useState(true)
  const [page, setPage]           = useState(1)
  const [statusChanging, setStatusChanging] = useState(null)

  const fetchMine = useCallback(async pg => {
    setLoading(true)
    try {
      const { data } = await client.get('/posts/mine', { params: { page: pg, limit: 20 } })
      setPosts(data.posts)
      setPagination(data.pagination)
    } catch { setPosts([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchMine(page) }, [page, fetchMine])

  const changeStatus = async (postId, status) => {
    setStatusChanging(postId)
    try {
      const { data } = await client.patch(`/posts/${postId}/status`, { status })
      setPosts(ps => ps.map(p => p.id === postId ? { ...p, status: data.status } : p))
    } catch (err) { alert(err.response?.data?.error ?? 'Failed') }
    finally { setStatusChanging(null) }
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
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium">No posts yet.</p>
          <Link to="/posts/create" className="btn-primary mt-4 inline-flex">Create your first post</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700 bg-zinc-900/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Post</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden sm:table-cell">Domain</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden md:table-cell">Created</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700/50">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-zinc-700/20 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/posts/${post.id}`} className="font-medium text-slate-200 hover:text-sky-400 transition-colors line-clamp-1">{post.title}</Link>
                    <p className="text-xs text-slate-500 mt-0.5">📍 {post.city} · {post.stage}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell"><DomainBadge domain={post.domain} /></td>
                  <td className="px-4 py-3"><StatusBadge status={post.status} /></td>
                  <td className="px-4 py-3 text-xs text-slate-500 hidden md:table-cell">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link to={`/posts/${post.id}/edit`} className="btn-ghost text-xs px-2 py-1">Edit</Link>
                      <select
                        className="input text-xs py-1 px-2 w-auto"
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-30">← Prev</button>
          <span className="text-sm text-slate-400 flex items-center">{page} / {pagination.totalPages}</span>
          <button disabled={page>=pagination.totalPages} onClick={()=>setPage(p=>p+1)} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-30">Next →</button>
        </div>
      )}
    </div>
  )
}
