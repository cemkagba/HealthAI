import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'sonner'
import client from '../api/client'
import { User, Mail, Building2, ShieldAlert, LogOut, Trash2 } from 'lucide-react'
import { RoleBadge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'

export default function ProfileSettings() {
  const { user, logout } = useAuth()
const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDeleteAccount = async () => {
    setLoading(true)
    try {
      await client.delete('/auth/me')
      logout()
      navigate('/login')
      toast.info('Account deleted permanently.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete account.')
      setShowConfirm(false)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-12">
      <div>
        <h1 className="page-title">Profile & Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account details and preferences.</p>
      </div>

      <div className="card p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
        <h2 className="text-lg font-semibold text-slate-100 border-b border-white/10 pb-4 mb-6">Account Information</h2>
        
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg border-2 border-slate-900 ring-2 ring-sky-500/30">
              {user.full_name[0]}
            </div>
            <div>
              <p className="text-xl font-bold text-slate-100">{user.full_name}</p>
              <div className="mt-1"><RoleBadge role={user.role} /></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Mail size={14} /> Email</span>
              <p className="text-sm text-slate-300 font-medium">{user.email}</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Building2 size={14} /> Institution</span>
              <p className="text-sm text-slate-300 font-medium">{user.institution || 'Not provided'}</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><User size={14} /> Member Since</span>
              <p className="text-sm text-slate-300 font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-rose-900/50 bg-rose-950/10 p-6">
        <h2 className="text-lg font-semibold text-rose-400 border-b border-rose-900/30 pb-4 mb-6 flex items-center gap-2">
          <ShieldAlert size={20} /> Danger Zone
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Once you delete your account, there is no going back. All your posts, meeting requests, and profile information will be permanently deleted.
        </p>

        {!showConfirm ? (
          <button onClick={() => setShowConfirm(true)} className="btn bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 border border-rose-600/20 hover:border-rose-600/40">
            <Trash2 size={16} /> Delete Account
          </button>
        ) : (
          <div className="bg-rose-950/40 border border-rose-900 p-4 rounded-xl">
            <p className="text-rose-300 text-sm font-medium mb-4">Are you absolutely sure you want to delete your account?</p>
            <div className="flex items-center gap-3">
              <button onClick={handleDeleteAccount} disabled={loading} className="btn-danger">
                {loading ? <Spinner size="sm" /> : 'Yes, Delete My Account'}
              </button>
              <button onClick={() => setShowConfirm(false)} disabled={loading} className="btn-ghost">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
