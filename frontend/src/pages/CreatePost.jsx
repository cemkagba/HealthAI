import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import client from '../api/client'
import { Spinner } from '../components/ui/Spinner'

const DOMAINS   = ['Cardiology','Radiology','Health Informatics','Oncology','Neurology','Dermatology','Emergency Medicine','Surgery','Pediatrics','Psychiatry','Other']
const EXPERTISE = ['Machine Learning','Deep Learning','NLP','Computer Vision','Federated Learning','Data Engineering','MLOps','Signal Processing','Bioinformatics','Other']
const STAGES    = ['Ideation','Literature Review','Prototype','Proof of Concept','Clinical Validation','Research','Deployment']

const EMPTY = { title:'', domain:'', required_expertise:'', stage:'', city:'', description:'', status:'draft' }

export default function CreatePost() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const isEdit   = Boolean(id)
  const [form, setForm]     = useState(EMPTY)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    if (!isEdit) return
    client.get(`/posts/${id}`)
      .then(r => setForm({ title: r.data.title, domain: r.data.domain, required_expertise: r.data.required_expertise, stage: r.data.stage, city: r.data.city, description: r.data.description, status: r.data.status }))
      .catch(() => navigate('/my-posts'))
      .finally(() => setFetching(false))
  }, [id, isEdit, navigate])

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isEdit) {
        await client.put(`/posts/${id}`, form)
        navigate(`/posts/${id}`)
      } else {
        const { data } = await client.post('/posts', form)
        navigate(`/posts/${data.id}`)
      }
    } catch (err) {
      setError(err.response?.data?.error ?? 'Failed to save post.')
    } finally { setLoading(false) }
  }

  if (fetching) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      <div className="mb-6">
        <h2 className="page-title">{isEdit ? 'Edit Post' : 'Create New Post'}</h2>
        <p className="text-slate-500 text-sm mt-1">{isEdit ? 'Update your collaboration post.' : 'Share your research idea and find the right collaborator.'}</p>
      </div>

      <div className="card p-6">
        {error && <div className="mb-4 p-3 bg-rose-900/40 border border-rose-700/50 rounded-lg text-rose-300 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label" htmlFor="post-title">Title <span className="text-rose-400">*</span></label>
            <input id="post-title" type="text" className="input" placeholder="e.g. AI-Powered ECG Anomaly Detection" value={form.title} onChange={set('title')} required />
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
            <textarea id="post-description" className="input resize-none h-36" placeholder="Describe the research problem, the data you have, what the collaborator will work on, and the expected outcome…" value={form.description} onChange={set('description')} required />
          </div>
          <div>
            <label className="label" htmlFor="post-status">Initial Status</label>
            <select id="post-status" className="input" value={form.status} onChange={set('status')}>
              <option value="draft">Draft — only visible to me</option>
              <option value="active">Active — visible to everyone</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" id="post-submit" disabled={loading}>
              {loading ? <><Spinner size="sm" />{isEdit ? 'Saving…' : 'Publishing…'}</> : isEdit ? 'Save Changes' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
