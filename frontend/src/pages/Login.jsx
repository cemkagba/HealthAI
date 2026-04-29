import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import { Spinner } from '../components/ui/Spinner'

export default function Login() {
  const [form, setForm]     = useState({ email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { login }           = useAuth()
  const navigate            = useNavigate()

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await client.post('/auth/login', form)
      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error ?? 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 items-center justify-center text-2xl font-black text-white shadow-2xl shadow-sky-900/40 mb-4">H</div>
          <h1 className="text-2xl font-bold text-slate-100">HEALTH AI Platform</h1>
          <p className="text-slate-500 text-sm mt-1">Co-Creation & Innovation Network</p>
        </div>

        <div className="card p-8">
          <h2 className="text-lg font-semibold text-slate-100 mb-6">Sign in to your account</h2>

          {error && (
            <div className="mb-4 p-3 bg-rose-900/40 border border-rose-700/50 rounded-lg text-rose-300 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="login-email">Academic Email</label>
              <input id="login-email" type="email" className="input" placeholder="you@university.edu.tr" value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <label className="label" htmlFor="login-password">Password</label>
              <input id="login-password" type="password" className="input" placeholder="••••••••" value={form.password} onChange={set('password')} required />
            </div>
            <button type="submit" className="btn-primary w-full mt-2" disabled={loading} id="login-submit">
              {loading ? <><Spinner size="sm" /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-sky-400 hover:text-sky-300 font-medium">Create one</Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Seed accounts: <span className="font-mono text-slate-500">admin@hospital.edu</span> · <span className="font-mono text-slate-500">elif@metu.edu.tr</span> · <span className="font-mono text-slate-500">ahmet@hacettepe.edu.tr</span>
        </p>
      </div>
    </div>
  )
}
