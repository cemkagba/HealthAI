import { useState, useEffect, useCallback } from 'react'
import client from '../api/client'
import { StatusBadge, RoleBadge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { formatDistanceToNow, format } from 'date-fns'

const TABS = ['overview','users','posts','logs']

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview')
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-amber-600/20 border border-amber-700/40 flex items-center justify-center text-amber-400">⚙</div>
        <div>
          <h2 className="page-title">Admin Dashboard</h2>
          <p className="text-slate-500 text-xs mt-0.5">System monitoring and user management</p>
        </div>
      </div>

      <div className="flex gap-1 bg-zinc-900 border border-zinc-700 rounded-xl p-1 w-fit flex-wrap">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} id={`admin-tab-${t}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${tab===t ? 'bg-zinc-700 text-slate-100 shadow' : 'text-slate-500 hover:text-slate-300'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab />}
      {tab === 'users'    && <UsersTab />}
      {tab === 'posts'    && <PostsTab />}
      {tab === 'logs'     && <LogsTab />}
    </div>
  )
}

// ── Overview ─────────────────────────────────────────────────────────────────
function OverviewTab() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    client.get('/admin/stats').then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>
  if (!stats) return null

  const totalPosts = Object.values(stats.posts || {}).reduce((a,b)=>a+b, 0)
  const statCards = [
    { label: 'Total Users',      value: stats.users.total,         sub: `${stats.users.suspended} suspended`, color: 'text-sky-400' },
    { label: 'Total Posts',      value: totalPosts,                sub: `${stats.posts.active ?? 0} active`, color: 'text-emerald-400' },
    { label: 'Active Meetings',  value: stats.meetings.accepted ?? 0, sub: `${stats.meetings.pending ?? 0} pending`, color: 'text-purple-400' },
    { label: 'Audit Log Entries',value: stats.totalLogEntries,     sub: 'all time', color: 'text-amber-400' },
  ]

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(c => (
          <div key={c.label} className="card p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">{c.label}</p>
            <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-slate-500 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>
      <div className="card p-5">
        <p className="section-title mb-4">Posts by Status</p>
        <div className="flex flex-wrap gap-3">
          {Object.entries(stats.posts || {}).map(([status, count]) => (
            <div key={status} className="flex items-center gap-2">
              <StatusBadge status={status} />
              <span className="text-sm font-semibold text-slate-100">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Users ─────────────────────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers]     = useState([])
  const [pagination, setPagination] = useState({ totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState('')
  const [applied, setApplied] = useState('')
  const [toggling, setToggling] = useState(null)

  const fetch = useCallback(async (pg, s) => {
    setLoading(true)
    try {
      const { data } = await client.get('/admin/users', { params: { page: pg, limit: 20, search: s } })
      setUsers(data.users); setPagination(data.pagination)
    } catch { setUsers([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch(page, applied) }, [page, applied, fetch])

  const toggleSuspend = async (userId, suspended) => {
    setToggling(userId)
    try { await client.patch(`/admin/users/${userId}/suspend`, { suspended }); fetch(page, applied) }
    catch (err) { alert(err.response?.data?.error ?? 'Failed') }
    finally { setToggling(null) }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={e => { e.preventDefault(); setPage(1); setApplied(search) }} className="flex gap-2">
        <input className="input flex-1 max-w-xs" placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} id="admin-user-search" />
        <button type="submit" className="btn-secondary text-xs px-3">Search</button>
        <button type="button" className="btn-ghost text-xs px-3" onClick={() => { setSearch(''); setApplied(''); setPage(1) }}>Clear</button>
      </form>

      {loading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-zinc-700 bg-zinc-900/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">User</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden sm:table-cell">Role</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden md:table-cell">Joined</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-zinc-700/50">
              {users.map(u => (
                <tr key={u.id} className={`hover:bg-zinc-700/20 transition-colors ${u.is_suspended ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-200">{u.full_name}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                    {u.is_suspended && <span className="text-xs text-rose-400 font-medium">⊘ Suspended</span>}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell"><RoleBadge role={u.role} /></td>
                  <td className="px-4 py-3 text-xs text-slate-500 hidden md:table-cell">{formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}</td>
                  <td className="px-4 py-3 text-right">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => toggleSuspend(u.id, !u.is_suspended)}
                        disabled={toggling === u.id}
                        id={`suspend-${u.id}`}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${u.is_suspended ? 'bg-emerald-800/50 text-emerald-300 hover:bg-emerald-700/50' : 'bg-rose-900/50 text-rose-300 hover:bg-rose-800/50'}`}
                      >
                        {toggling===u.id ? <Spinner size="sm" /> : u.is_suspended ? 'Unsuspend' : 'Suspend'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager page={page} totalPages={pagination.totalPages} setPage={setPage} />
    </div>
  )
}

// ── Posts (all statuses) ──────────────────────────────────────────────────────
function PostsTab() {
  const [posts, setPosts]     = useState([])
  const [pagination, setPagination] = useState({ totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(1)
  const [deleting, setDeleting] = useState(null)

  const fetch = useCallback(async pg => {
    setLoading(true)
    try { const { data } = await client.get('/admin/posts', { params: { page: pg, limit: 20 } }); setPosts(data.posts); setPagination(data.pagination) }
    catch { setPosts([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch(page) }, [page, fetch])

  const deletePost = async id => {
    if (!confirm('Permanently remove this post? This cannot be undone.')) return
    setDeleting(id)
    try { await client.delete(`/admin/posts/${id}`); fetch(page) }
    catch (err) { alert(err.response?.data?.error ?? 'Failed') }
    finally { setDeleting(null) }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>

  return (
    <div className="space-y-4">
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-zinc-700 bg-zinc-900/50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Post</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden sm:table-cell">Owner</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Remove</th>
          </tr></thead>
          <tbody className="divide-y divide-zinc-700/50">
            {posts.map(p => (
              <tr key={p.id} className="hover:bg-zinc-700/20 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-200 line-clamp-1">{p.title}</p>
                  <p className="text-xs text-slate-500">{p.domain} · {p.city}</p>
                </td>
                <td className="px-4 py-3 text-xs text-slate-400 hidden sm:table-cell">{p.owner_name}<br/><span className="text-slate-600">{p.owner_email}</span></td>
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => deletePost(p.id)} disabled={deleting===p.id} id={`delete-post-${p.id}`}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium bg-rose-900/50 text-rose-300 hover:bg-rose-800/50 transition-all disabled:opacity-40">
                    {deleting===p.id ? <Spinner size="sm" /> : 'Remove'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager page={page} totalPages={pagination.totalPages} setPage={setPage} />
    </div>
  )
}

// ── Audit Logs ────────────────────────────────────────────────────────────────
function LogsTab() {
  const [logs, setLogs]       = useState([])
  const [pagination, setPagination] = useState({ totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(1)

  useEffect(() => {
    setLoading(true)
    client.get('/admin/logs', { params: { page, limit: 50 } })
      .then(r => { setLogs(r.data.logs); setPagination(r.data.pagination) })
      .catch(() => setLogs([]))
      .finally(() => setLoading(false))
  }, [page])

  const ACTION_COLORS = {
    USER_REGISTERED: 'text-emerald-400', USER_LOGIN: 'text-sky-400',
    USER_SUSPENDED: 'text-rose-400', USER_UNSUSPENDED: 'text-emerald-400',
    POST_CREATED: 'text-sky-400', POST_UPDATED: 'text-amber-400',
    POST_STATUS_CHANGED: 'text-indigo-400', POST_REMOVED_BY_ADMIN: 'text-rose-400',
    MEETING_REQUEST_SENT: 'text-purple-400', MEETING_REQUEST_ACCEPTED: 'text-emerald-400',
    MEETING_REQUEST_REJECTED: 'text-rose-400', SYSTEM_SEED: 'text-zinc-400',
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>

  return (
    <div className="space-y-4">
      <div className="card overflow-hidden">
        <table className="w-full text-xs">
          <thead><tr className="border-b border-zinc-700 bg-zinc-900/50">
            <th className="text-left px-4 py-3 font-semibold text-slate-400 uppercase tracking-wide">Action</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-400 uppercase tracking-wide hidden sm:table-cell">Actor</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-400 uppercase tracking-wide hidden md:table-cell">Target</th>
            <th className="text-right px-4 py-3 font-semibold text-slate-400 uppercase tracking-wide">Time</th>
          </tr></thead>
          <tbody className="divide-y divide-zinc-700/50 font-mono">
            {logs.map(l => (
              <tr key={l.id} className="hover:bg-zinc-700/20 transition-colors">
                <td className="px-4 py-2.5">
                  <span className={`font-semibold ${ACTION_COLORS[l.action] ?? 'text-slate-300'}`}>{l.action}</span>
                </td>
                <td className="px-4 py-2.5 text-slate-400 hidden sm:table-cell">{l.actor_name ?? <span className="text-slate-600">system</span>}</td>
                <td className="px-4 py-2.5 hidden md:table-cell">
                  {l.target_type && <span className="text-slate-500">{l.target_type} <span className="text-slate-700">{l.target_id?.slice(0,8)}…</span></span>}
                </td>
                <td className="px-4 py-2.5 text-right text-slate-600">{format(new Date(l.created_at), 'dd MMM, HH:mm:ss')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager page={page} totalPages={pagination.totalPages} setPage={setPage} />
    </div>
  )
}

function Pager({ page, totalPages, setPage }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex justify-center gap-2">
      <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-30">← Prev</button>
      <span className="text-sm text-slate-400 flex items-center">{page} / {totalPages}</span>
      <button disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-30">Next →</button>
    </div>
  )
}
