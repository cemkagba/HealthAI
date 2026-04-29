import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const TITLES = {
  '/dashboard':    'Dashboard',
  '/posts/create': 'Create New Post',
  '/my-posts':     'My Posts',
  '/meetings':     'Meeting Requests',
  '/admin':        'Admin Dashboard',
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const title = Object.entries(TITLES).find(([k]) => location.pathname.startsWith(k))?.[1] ?? 'HEALTH AI'

  return (
    <header className="h-14 bg-zinc-900/80 backdrop-blur border-b border-zinc-800 flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-sm font-semibold text-slate-300">{title}</h1>
      <div className="flex items-center gap-3">
        <span className="hidden sm:block text-xs text-slate-500">{user?.institution}</span>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-600 to-indigo-700 flex items-center justify-center text-xs font-bold text-white shadow">
          {user?.full_name?.[0] ?? '?'}
        </div>
        <button
          onClick={() => { logout(); navigate('/login') }}
          className="hidden md:block text-xs text-slate-500 hover:text-rose-400 transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
