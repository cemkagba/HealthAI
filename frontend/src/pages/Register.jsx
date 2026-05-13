import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'sonner'
import client from '../api/client'
import { Spinner } from '../components/ui/Spinner'
import { HeartPulse, User, Mail, Lock, Building2, Briefcase, ArrowRight } from 'lucide-react'

const ROLES = [
  { value: 'engineer',                label: 'Engineer / Researcher' },
  { value: 'healthcare_professional', label: 'Healthcare Professional' },
]

export default function Register() {
  const [form, setForm]   = useState({ full_name: '', email: '', password: '', role: '', institution: '' })
  const [loading, setLoading] = useState(false)
  const { login }         = useAuth()
const navigate          = useNavigate()

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await client.post('/auth/register', form)
      login(data.token, data.user)
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse-glow"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-600/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }}></div>

      <div className="w-full max-w-lg animate-slide-up relative z-10 py-8">
        <div className="text-center mb-8 animate-float">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 items-center justify-center text-white shadow-2xl shadow-sky-900/50 mb-5 border border-white/10">
            <HeartPulse size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">Join HEALTH AI</h1>
          <p className="text-sky-400/80 text-sm mt-1.5 font-medium tracking-wide uppercase">Academic email required (.edu or .edu.tr)</p>
        </div>

        <div className="card p-8 shadow-2xl shadow-black/50 border border-white/5 bg-slate-900/60 backdrop-blur-2xl">
          <h2 className="text-xl font-bold text-slate-100 mb-6">Create your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="reg-name">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input id="reg-name" type="text" className="input pl-10" placeholder="Dr. Jane Smith" value={form.full_name} onChange={set('full_name')} required />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="reg-email">Academic Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input id="reg-email" type="email" className="input pl-10" placeholder="jane@university.edu.tr" value={form.email} onChange={set('email')} required />
              </div>
              <p className="mt-1.5 text-xs text-slate-500 ml-1">Must end with <code className="text-sky-400/80 bg-sky-900/30 px-1 py-0.5 rounded">.edu</code> or <code className="text-sky-400/80 bg-sky-900/30 px-1 py-0.5 rounded">.edu.tr</code></p>
            </div>
            <div>
              <label className="label" htmlFor="reg-password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input id="reg-password" type="password" className="input pl-10" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} required minLength={8} />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="reg-role">Role</label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <select id="reg-role" className="input pl-10 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjIwIiB2aWV3Qm94PSIwIDAgMjAgMjAiIHdpZHRoPSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCA3TDEwIDEzTDE2IDciIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=')] bg-no-repeat bg-[position:right_0.75rem_center] bg-[length:1.25em_1.25em]" value={form.role} onChange={set('role')} required>
                  <option value="">Select your role…</option>
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label" htmlFor="reg-institution">Institution / University</label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input id="reg-institution" type="text" className="input pl-10" placeholder="Middle East Technical University" value={form.institution} onChange={set('institution')} />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full mt-6 py-3 text-base" disabled={loading} id="register-submit">
              {loading ? <><Spinner size="sm" /> Creating account…</> : <><span className="flex-1 text-center">Create Account</span> <ArrowRight size={18} className="absolute right-6 opacity-70 group-hover:translate-x-1 transition-transform" /></>}
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
