import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'sonner'
import client from '../api/client'
import { Spinner } from '../components/ui/Spinner'
import { HeartPulse, Mail, Lock, ArrowRight } from 'lucide-react'

export default function Login() {
  const [form, setForm]     = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login }           = useAuth()
const navigate            = useNavigate()

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await client.post('/auth/login', form)
      login(data.token, data.user)
      toast.success(`Welcome back, ${data.user.full_name}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-600/20 rounded-full blur-[120px] animate-pulse-glow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }}></div>

      <div className="w-full max-w-md animate-slide-up relative z-10">
        {/* Logo */}
        <div className="text-center mb-10 animate-float">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 items-center justify-center text-white shadow-2xl shadow-sky-900/50 mb-5 border border-white/10">
            <HeartPulse size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">HEALTH AI</h1>
          <p className="text-sky-400/80 text-sm mt-1.5 font-medium tracking-wide uppercase">Co-Creation & Innovation Network</p>
        </div>

        <div className="card p-8 shadow-2xl shadow-black/50 border border-white/5 bg-slate-900/60 backdrop-blur-2xl">
          <h2 className="text-xl font-bold text-slate-100 mb-6">Welcome Back</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label" htmlFor="login-email">Academic Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input id="login-email" type="email" className="input pl-10" placeholder="you@university.edu.tr" value={form.email} onChange={set('email')} required />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="login-password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input id="login-password" type="password" className="input pl-10" placeholder="••••••••" value={form.password} onChange={set('password')} required />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full mt-4 py-3 text-base" disabled={loading} id="login-submit">
              {loading ? <><Spinner size="sm" /> Signing in…</> : <><span className="flex-1 text-center">Sign In</span> <ArrowRight size={18} className="absolute right-6 opacity-70 group-hover:translate-x-1 transition-transform" /></>}
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
