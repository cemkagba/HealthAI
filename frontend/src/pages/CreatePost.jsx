import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import client from '../api/client'
import { Spinner } from '../components/ui/Spinner'
import { CalendarDays, Info, AlertCircle } from 'lucide-react'
import TiptapEditor from '../components/ui/TiptapEditor'

const DOMAINS   = ['Cardiology','Radiology','Health Informatics','Oncology','Neurology','Dermatology','Emergency Medicine','Surgery','Pediatrics','Psychiatry','Other']
const EXPERTISE = ['Machine Learning','Deep Learning','NLP','Computer Vision','Federated Learning','Data Engineering','MLOps','Signal Processing','Bioinformatics','Other']
const STAGES    = ['Ideation','Literature Review','Prototype','Proof of Concept','Clinical Validation','Research','Deployment']

const EMPTY = { title:'', domain:'', required_expertise:'', stage:'', city:'', description:'', status:'draft', duration_days: 20 }

export default function CreatePost() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const isEdit   = Boolean(id)
const [form, setForm]         = useState(EMPTY)
  const [loading, setLoading]   = useState(false)
  const [fetching, setFetching] = useState(isEdit)

  // Real-time Validation States
  const titleErr = form.title && form.title.length < 5 ? 'Title must be at least 5 characters.' : ''
  const descErr  = form.description && form.description === '<p></p>' ? 'Description cannot be empty.' : ''
  const isInvalid = titleErr || descErr || !form.title || !form.domain || !form.required_expertise || !form.stage || !form.city || !form.description || form.description === '<p></p>'

  const set = k => e => setForm(f => ({ ...f, [k]: e?.target ? e.target.value : e }))

  useEffect(() => {
    if (!isEdit) return
    client.get(`/posts/${id}`)
      .then(r => setForm({
        title: r.data.title,
        domain: r.data.domain,
        required_expertise: r.data.required_expertise,
        stage: r.data.stage,
        city: r.data.city,
        description: r.data.description,
        status: r.data.status,
        duration_days: 20,
      }))
      .catch(() => navigate('/my-posts'))
      .finally(() => setFetching(false))
  }, [id, isEdit, navigate])

  const handleSubmit = async e => {
    e.preventDefault()
    if (isInvalid) return toast.error('Please fix validation errors before submitting.')
    setLoading(true)
    try {
      if (isEdit) {
        await client.put(`/posts/${id}`, form)
        toast.success('Post updated successfully.')
        navigate(`/posts/${id}`)
      } else {
        const { data } = await client.post('/posts', form)
        toast.success('Post published successfully.')
        navigate(`/posts/${data.id}`)
      }
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Failed to save post.')
    } finally {
      setLoading(false)
    }
  }

  const days = parseInt(form.duration_days) || 20
  const expiryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  const expiryStr  = expiryDate.toLocaleDateString('tr-TR', { day:'2-digit', month:'long', year:'numeric' })

  if (fetching) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      <div className="mb-6">
        <h2 className="page-title">{isEdit ? 'Edit Post' : 'Create New Post'}</h2>
        <p className="text-slate-500 text-sm mt-1">{isEdit ? 'Update your collaboration post.' : 'Share your research idea and find the right collaborator.'}</p>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label" htmlFor="post-title">Title <span className="text-rose-400">*</span></label>
            <input 
              id="post-title" 
              type="text" 
              className={`input ${titleErr ? 'border-rose-500/50 focus:ring-rose-500/50 bg-rose-500/5' : ''}`} 
              placeholder="e.g. AI-Powered ECG Anomaly Detection" 
              value={form.title} 
              onChange={set('title')} 
              required 
            />
            {titleErr && <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> {titleErr}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="post-domain">Medical Domain <span className="text-rose-400">*</span></label>
              <select id="post-domain" className="input" value={form.domain} onChange={set('domain')} required>
                <option value="">Select domain…</option>
                {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="post-expertise">Required Expertise <span className="text-rose-400">*</span></label>
              <select id="post-expertise" className="input" value={form.required_expertise} onChange={set('required_expertise')} required>
                <option value="">Select expertise…</option>
                {EXPERTISE.map(x => <option key={x} value={x}>{x}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="post-stage">Project Stage <span className="text-rose-400">*</span></label>
              <select id="post-stage" className="input" value={form.stage} onChange={set('stage')} required>
                <option value="">Select stage…</option>
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="post-city">City <span className="text-rose-400">*</span></label>
              <input id="post-city" type="text" className="input" placeholder="e.g. Ankara" value={form.city} onChange={set('city')} required />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="post-description">Description <span className="text-rose-400">*</span></label>
            <TiptapEditor 
              value={form.description} 
              onChange={set('description')} 
              placeholder="Describe the research problem, the data you have, what the collaborator will work on, and the expected outcome…" 
              isError={!!descErr}
            />
            {descErr && <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> {descErr}</p>}
          </div>
          <div>
            <label className="label" htmlFor="post-status">Initial Status</label>
            <select id="post-status" className="input" value={form.status} onChange={set('status')}>
              <option value="draft">Draft — only visible to me</option>
              <option value="active">Active — visible to everyone</option>
            </select>
          </div>

          {/* Expiry duration — only on create */}
          {!isEdit && (
            <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-sky-400" />
                <label className="label mb-0 text-sm font-semibold" htmlFor="post-duration">
                  Post Duration
                </label>
                <span className="text-xs text-slate-500 ml-auto">min 20 days · max 90 days</span>
              </div>
              <div className="flex items-center gap-4">
                <input
                  id="post-duration"
                  type="range"
                  min={20}
                  max={90}
                  step={1}
                  value={form.duration_days}
                  onChange={set('duration_days')}
                  className="flex-1 accent-sky-500"
                />
                <div className="w-14 text-center">
                  <span className="text-lg font-bold text-sky-400">{form.duration_days}</span>
                  <span className="text-xs text-slate-500 block">days</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Info size={12} className="text-slate-500 flex-shrink-0" />
                <span>
                  This post will automatically expire on{' '}
                  <span className="text-sky-400 font-semibold">{expiryStr}</span>.
                  You can extend it later from My Posts.
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" id="post-submit" disabled={loading || !!isInvalid}>
              {loading ? <><Spinner size="sm" />{isEdit ? 'Saving…' : 'Publishing…'}</> : isEdit ? 'Save Changes' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
