import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { RoleBadge } from '../ui/Badge'
import { LayoutDashboard, PlusSquare, Layers, CalendarHeart, Settings, HeartPulse, LogOut, X } from 'lucide-react'

const NAV = [
  { to: '/dashboard',    label: 'Dashboard',         icon: <LayoutDashboard size={18} /> },
  { to: '/posts/create', label: 'Create Post',       icon: <PlusSquare size={18} /> },
  { to: '/my-posts',     label: 'My Posts',          icon: <Layers size={18} /> },
  { to: '/meetings',     label: 'Meeting Requests',  icon: <CalendarHeart size={18} /> },
]

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed inset-y-0 left-0 z-50 transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col w-64 bg-slate-950 border-r border-white/5 flex-shrink-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-600/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-900/40 border border-white/10">
            <HeartPulse size={22} strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <p className="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight leading-tight">HEALTH AI</p>
            <p className="text-[10px] text-sky-400/80 font-medium uppercase tracking-wider mt-0.5">Platform</p>
          </div>
          <button onClick={() => setMobileOpen(false)} className="md:hidden text-slate-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-sky-500/10 text-sky-400 border-l-4 border-l-sky-500 shadow-inner'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border-l-4 border-l-transparent'
              }`
            }
          >
            <span className={`flex-shrink-0 transition-colors ${location.pathname === to ? 'text-sky-400' : 'group-hover:text-slate-300'}`}>{icon}</span>
            {label}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <div className="pt-4 mt-4 border-t border-white/5 relative">
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Admin</p>
            <NavLink
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 border-l-4 border-l-amber-500 shadow-inner'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border-l-4 border-l-transparent'
                }`
              }
            >
              <span className={`flex-shrink-0 transition-colors ${location.pathname === '/admin' ? 'text-amber-400' : 'group-hover:text-slate-300'}`}><Settings size={18} /></span>
              Admin Dashboard
            </NavLink>
          </div>
        )}
      </nav>

      {/* User card bottom */}
      {user && (
        <div className="p-4 border-t border-white/5 bg-slate-900/30">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-3 backdrop-blur-sm shadow-inner">
            <p className="text-sm font-bold text-slate-100 truncate">{user.full_name}</p>
            <p className="text-xs text-slate-400 truncate mb-2">{user.email}</p>
            <RoleBadge role={user.role} />
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 justify-center px-3 py-2.5 text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      )}
    </aside>
    </>
  )
}
