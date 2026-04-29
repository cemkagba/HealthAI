import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import { StatusBadge, DomainBadge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { formatDistanceToNow } from 'date-fns'

const DOMAINS    = ['Cardiology','Radiology','Health Informatics','Oncology','Neurology','Dermatology','Emergency Medicine','Surgery','Pediatrics','Psychiatry']
const EXPERTISE  = ['Machine Learning','Deep Learning','NLP','Computer Vision','Federated Learning','Data Engineering','MLOps','Signal Processing']

export default function Dashboard() {
  const { user } = useAuth()
  const [posts, setPosts]       = useState([])
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(1)
  const [filters, setFilters]   = useState({ domain: '', expertise: '', city: '' })
  const [applied, setApplied]   = useState({})

  const fetchPosts = useCallback(async (appliedFilters, pg) => {
    setLoading(true)
    try {
      const params = { page: pg, limit: 12, ...Object.fromEntries(Object.entries(appliedFilters).filter(([,v]) => v)) }
      const { data } = await client.get('/posts', { params })
      setPosts(data.posts)
      setPagination(data.pagination)
    } catch { setPosts([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchPosts(applied, page) }, [applied, page, fetchPosts])

  const handleSearch = e => { e.preventDefault(); setPage(1); setApplied({ ...filters }) }
  const handleClear  = () => { setFilters({ domain: '', expertise: '', city: '' }); setApplied({}); setPage(1) }
  const setF = k => e => setFilters(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero */}
      <div className="bg-gradient-to-r from-sky-900/40 to-indigo-900/30 border border-sky-800/40 rounded-2xl px-6 py-5">
        <h2 className="text-xl font-bold text-slate-100">Welcome back, {user?.full_name?.split(' ')[0]} 👋</h2>
        <p className="text-slate-400 text-sm mt-1">Discover active research collaborations seeking your expertise.</p>
      </div>

      {/* Filter bar — all filtering is server-side */}
      <form onSubmit={handleSearch} className="card p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[160px]">
          <label className="label">Domain</label>
          <select className="input" value={filters.domain} onChange={setF('domain')} id="filter-domain">
            <option value="">All Domains</option>
            {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="label">Expertise</label>
          <select className="input" value={filters.expertise} onChange={setF('expertise')} id="filter-expertise">
            <option value="">All Expertise</option>
            {EXPERTISE.map(x => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="label">City</label>
          <input className="input" placeholder="e.g. Ankara" value={filters.city} onChange={setF('city')} id="filter-city" />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary" id="filter-search">Search</button>
          <button type="button" className="btn-secondary" onClick={handleClear}>Clear</button>
        </div>
      </form>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {loading ? 'Loading…' : `${pagination.total} active post${pagination.total !== 1 ? 's' : ''} found`}
        </p>
        <Link to="/posts/create" className="btn-primary text-xs">+ New Post</Link>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p className="text-4xl mb-3">🔬</p>
          <p className="font-medium">No posts match your filters.</p>
          <p className="text-sm mt-1">Try clearing filters or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {posts.map(post => <PostCard key={post.id} post={post} />)}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-30">← Prev</button>
          <span className="text-sm text-slate-400">{page} / {pagination.totalPages}</span>
          <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-30">Next →</button>
        </div>
      )}
    </div>
  )
}

function PostCard({ post }) {
  return (
    <Link to={`/posts/${post.id}`} className="card p-5 flex flex-col gap-3 hover:border-sky-700/60 hover:bg-zinc-800 transition-all duration-150 group block">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-100 group-hover:text-sky-300 transition-colors leading-snug line-clamp-2">{post.title}</h3>
        <StatusBadge status={post.status} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        <DomainBadge domain={post.domain} />
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-zinc-700/80 text-zinc-300">{post.required_expertise}</span>
      </div>
      <p className="text-xs text-slate-500 line-clamp-3 flex-1">{post.description}</p>
      <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-zinc-700">
        <span>📍 {post.city}</span>
        <span>{post.stage}</span>
        <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
      </div>
      <p className="text-xs text-slate-600">{post.owner_name} · {post.owner_institution}</p>
    </Link>
  )
}
