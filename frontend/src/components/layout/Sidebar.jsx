import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { RoleBadge } from '../ui/Badge'

const NAV = [
  { to: '/dashboard',  label: 'Dashboard',         icon: '⬡' },
  { to: '/posts/create', label: 'Create Post',      icon: '＋' },
  { to: '/my-posts',   label: 'My Posts',           icon: '▤' },
  { to: '/meetings',   label: 'Meeting Requests',   icon: '◷' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside className="hidden md:flex flex-col w-60 bg-zinc-900 border-r border-zinc-800 flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-sky-900/40">H</div>
          <div>
            <p className="text-sm font-bold text-slate-100 leading-none">HEALTH AI</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Co-Creation Platform</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-sky-600/20 text-sky-400 border border-sky-700/40'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-zinc-800'
              }`
            }
          >
            <span className="text-base w-4 text-center flex-shrink-0">{icon}</span>
            {label}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <div className="pt-3 mt-3 border-t border-zinc-800">
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-600">Admin</p>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-amber-600/20 text-amber-400 border border-amber-700/40'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-zinc-800'
                }`
              }
            >
              <span className="text-base w-4 text-center flex-shrink-0">⚙</span>
              Admin Dashboard
            </NavLink>
          </div>
        )}
      </nav>

      {/* User card */}
      {user && (
        <div className="px-3 py-4 border-t border-zinc-800">
          <div className="bg-zinc-800 rounded-lg p-3 mb-2">
            <p className="text-sm font-semibold text-slate-100 truncate">{user.full_name}</p>
            <p className="text-xs text-slate-500 truncate mb-1.5">{user.email}</p>
            <RoleBadge role={user.role} />
          </div>
          <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-xs text-slate-500 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors">
            → Sign out
          </button>
        </div>
      )}
    </aside>
  )
}
