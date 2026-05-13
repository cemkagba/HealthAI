import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'sonner'
import client from '../api/client'
import { StatusBadge, DomainBadge } from '../components/ui/Badge'
import Skeleton from '../components/ui/Skeleton'
import { formatDistanceToNow, differenceInDays } from 'date-fns'
import { Search, MapPin, Clock, Plus, Microscope, FilterX, Timer } from 'lucide-react'

const stripHtml = (html) => {
  if (!html) return '';
  let tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

const DOMAINS    = ['Cardiology','Radiology','Health Informatics','Oncology','Neurology','Dermatology','Emergency Medicine','Surgery','Pediatrics','Psychiatry']
const EXPERTISE  = ['Machine Learning','Deep Learning','NLP','Computer Vision','Federated Learning','Data Engineering','MLOps','Signal Processing']

// ── Expiry helper ─────────────────────────────────────────────────────────────
function getExpiryInfo(expires_at) {
  if (!expires_at) return null
  const daysLeft = differenceInDays(new Date(expires_at), new Date())
  if (daysLeft < 0) return { daysLeft: 0, label: 'Expired', color: 'text-slate-500', bg: 'bg-slate-500/10', bar: 'bg-slate-500', pulse: false }
  if (daysLeft < 5)  return { daysLeft, label: `${daysLeft}d left`, color: 'text-rose-400',  bg: 'bg-rose-500/10',  bar: 'bg-rose-500',  pulse: true  }
  if (daysLeft < 10) return { daysLeft, label: `${daysLeft}d left`, color: 'text-amber-400', bg: 'bg-amber-500/10', bar: 'bg-amber-500', pulse: false }
  return { daysLeft, label: `${daysLeft}d left`, color: 'text-emerald-400', bg: 'bg-emerald-500/10', bar: 'bg-emerald-500', pulse: false }
}

export default function Dashboard() {
  const { user } = useAuth()
const [posts, setPosts]           = useState([])
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })
  const [loading, setLoading]       = useState(true)
  const [page, setPage]             = useState(1)
  const [filters, setFilters]       = useState({ domain: '', expertise: '', city: '' })
  const [applied, setApplied]       = useState({})

  const fetchPosts = useCallback(async (appliedFilters, pg) => {
    setLoading(true)
    try {
      const params = { page: pg, limit: 12, ...Object.fromEntries(Object.entries(appliedFilters).filter(([,v]) => v)) }
      const { data } = await client.get('/posts', { params })
      setPosts(data.posts)
      setPagination(data.pagination)
    } catch (err) {
      setPosts([])
      toast.error('Failed to load posts.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPosts(applied, page) }, [applied, page, fetchPosts])

  const handleSearch = e => { e.preventDefault(); setPage(1); setApplied({ ...filters }) }
  const handleClear  = () => { setFilters({ domain: '', expertise: '', city: '' }); setApplied({}); setPage(1) }
  const setF = k => e => setFilters(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Hero */}
      <div className="relative bg-gradient-to-r from-sky-900/60 to-indigo-900/40 border border-sky-500/20 rounded-3xl p-6 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-400/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="relative z-10 flex-1">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-sky-200">
            Welcome back, {user?.full_name?.split(' ')[0]} 👋
          </h2>
          <p className="text-sky-200/80 text-sm mt-1 max-w-lg leading-relaxed">
            Discover active research collaborations seeking your expertise in healthcare and technology.
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <form onSubmit={handleSearch} className="card p-4 flex flex-wrap gap-3 items-end sticky -top-6 z-20 shadow-2xl bg-slate-900/80">
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
          <button type="submit" className="btn-primary" id="filter-search"><Search size={16} /> Search</button>
          <button type="button" className="btn-secondary" onClick={handleClear}><FilterX size={16} /></button>
        </div>
      </form>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400 font-medium">
          {loading ? 'Loading…' : `${pagination.total} active post${pagination.total !== 1 ? 's' : ''} found`}
        </p>
        <Link to="/posts/create" className="btn-primary text-xs py-2 shadow-sky-500/30"><Plus size={16} /> New Post</Link>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-24 text-slate-500 bg-slate-900/30 border border-white/5 rounded-3xl">
          <Microscope className="w-16 h-16 mx-auto mb-4 text-slate-600 animate-pulse" strokeWidth={1} />
          <p className="text-lg font-medium text-slate-300">No posts match your filters.</p>
          <p className="text-sm mt-2 max-w-sm mx-auto">Try clearing some filters or check back later.</p>
          <button onClick={handleClear} className="btn-secondary mt-6"><FilterX size={16} /> Clear Filters</button>
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
  const expiry = getExpiryInfo(post.expires_at)

  return (
    <Link
      to={`/posts/${post.id}`}
      className="card p-6 flex flex-col gap-4 hover:border-sky-500/40 hover:bg-slate-800/80 hover:-translate-y-1 transition-all duration-300 group block relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-3xl group-hover:bg-sky-500/10 transition-colors pointer-events-none" />

      <div className="flex items-start justify-between gap-3 relative z-10">
        <h3 className="text-base font-bold text-slate-100 group-hover:text-sky-400 transition-colors leading-snug line-clamp-2">{post.title}</h3>
        <StatusBadge status={post.status} />
      </div>

      <div className="flex flex-wrap gap-2 relative z-10">
        <DomainBadge domain={post.domain} />
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wide bg-slate-800 text-slate-300 border border-slate-700">
          {post.required_expertise}
        </span>
      </div>

      <p className="text-sm text-slate-400 line-clamp-3 flex-1 leading-relaxed relative z-10">{stripHtml(post.description)}</p>

      {/* Expiry indicator */}
      {expiry && post.status === 'active' && (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${expiry.bg} border border-white/5 relative z-10`}>
          <Timer size={12} className={`${expiry.color} ${expiry.pulse ? 'animate-pulse' : ''}`} />
          <span className={`text-xs font-semibold ${expiry.color}`}>{expiry.label}</span>
          {/* Progress bar */}
          <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden ml-1">
            <div
              className={`h-full rounded-full transition-all ${expiry.bar}`}
              style={{ width: `${Math.min(100, Math.max(0, (expiry.daysLeft / 90) * 100))}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-white/5 relative z-10">
        <span className="flex items-center gap-1"><MapPin size={12} className="text-sky-500/70" /> {post.city}</span>
        <span className="flex items-center gap-1 font-medium bg-white/5 px-2 py-0.5 rounded-full text-slate-300">{post.stage}</span>
        <span className="flex items-center gap-1"><Clock size={12} className="text-sky-500/70" /> {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
      </div>

      <p className="text-xs text-slate-500 font-medium relative z-10">
        {post.owner_name} <span className="text-slate-600 mx-1">•</span> <span className="text-slate-400">{post.owner_institution}</span>
      </p>
    </Link>
  )
}
