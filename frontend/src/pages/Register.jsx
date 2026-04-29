import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import { Spinner } from '../components/ui/Spinner'

const ROLES = [
  { value: 'engineer',                label: 'Engineer / Researcher' },
  { value: 'healthcare_professional', label: 'Healthcare Professional' },
]

export default function Register() {
  const [form, setForm]   = useState({ full_name: '', email: '', password: '', role: '', institution: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login }         = useAuth()
  const navigate          = useNavigate()

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await client.post('/auth/register', form)
      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error ?? 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 items-center justify-center text-2xl font-black text-white shadow-2xl shadow-sky-900/40 mb-4">H</div>
          <h1 className="text-2xl font-bold text-slate-100">Join the Platform</h1>
          <p className="text-slate-500 text-sm mt-1">Academic email required (.edu or .edu.tr)</p>
        </div>

        <div className="card p-8">
          <h2 className="text-lg font-semibold text-slate-100 mb-6">Create your account</h2>

          {error && (
            <div className="mb-4 p-3 bg-rose-900/40 border border-rose-700/50 rounded-lg text-rose-300 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="reg-name">Full Name</label>
              <input id="reg-name" type="text" className="input" placeholder="Dr. Jane Smith" value={form.full_name} onChange={set('full_name')} required />
            </div>
            <div>
              <label className="label" htmlFor="reg-email">Academic Email</label>
              <input id="reg-email" type="email" className="input" placeholder="jane@university.edu.tr" value={form.email} onChange={set('email')} required />
              <p className="mt-1 text-xs text-slate-500">Must end with <code className="text-sky-400">.edu</code> or <code className="text-sky-400">.edu.tr</code></p>
            </div>
            <div>
              <label className="label" htmlFor="reg-password">Password</label>
              <input id="reg-password" type="password" className="input" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} required minLength={8} />
            </div>
            <div>
              <label className="label" htmlFor="reg-role">Role</label>
              <select id="reg-role" className="input" value={form.role} onChange={set('role')} required>
                <option value="">Select your role…</option>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="reg-institution">Institution / University</label>
              <input id="reg-institution" type="text" className="input" placeholder="Middle East Technical University" value={form.institution} onChange={set('institution')} />
            </div>
            <button type="submit" className="btn-primary w-full mt-2" disabled={loading} id="register-submit">
              {loading ? <><Spinner size="sm" /> Creating account…</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-400 hover:text-sky-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
