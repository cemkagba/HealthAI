import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'sonner'
import client from '../../api/client'
import { Bell, CheckCircle2, ExternalLink, Menu } from 'lucide-react'
import EmptyState from '../ui/EmptyState'

const TITLES = {
  '/dashboard':    'Dashboard',
  '/posts/create': 'Create New Post',
  '/my-posts':     'My Posts',
  '/meetings':     'Meeting Requests',
  '/admin':        'Admin Dashboard',
  '/profile':      'Profile & Settings',
}

const NOTIF_URLS = {
  MEETING_REQUEST:    '/meetings',
  MEETING_ACCEPTED:   '/meetings',
  MEETING_REJECTED:   '/meetings',
  MEETING_CANCELLED:  '/meetings',
  POST_EXPIRED:       '/my-posts',
  POST_STATUS_CHANGED:'/my-posts',
}

function getNotifUrl(notif) {
  return notif.link_url || NOTIF_URLS[notif.type] || null
}

// Accepts notifications from App-level state so it's always in sync with popups
export default function Navbar({ notifications = [], setNotifications, setMobileOpen }) {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [showNotifs, setShowNotifs] = useState(false)
  const notifRef = useRef(null)

  useEffect(() => {
    const clickAway = e => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false)
    }
    document.addEventListener('mousedown', clickAway)
    return () => document.removeEventListener('mousedown', clickAway)
  }, [])

  const unreadCount = notifications.filter(n => !n.is_read).length

  const markRead = async (id) => {
    try {
      await client.patch(`/notifications/${id}/read`)
      if (setNotifications) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      }
    } catch (err) {
      toast.error('Failed to mark notification as read.')
    }
  }

  const markAllRead = async () => {
    try {
      await client.patch('/notifications/read-all')
      if (setNotifications) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      }
    } catch (err) {
      toast.error('Failed to mark all as read.')
    }
  }

  const handleNotifClick = async (notif) => {
    const url = getNotifUrl(notif)
    if (!notif.is_read) await markRead(notif.id)
    if (url) {
      setShowNotifs(false)
      navigate(url)
    }
  }

  const title = Object.entries(TITLES).find(([k]) => location.pathname.startsWith(k))?.[1] ?? 'HEALTH AI'

  return (
    <header className="h-16 bg-slate-900/60 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 flex-shrink-0 z-20 sticky top-0">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2 text-slate-400 hover:text-slate-100 transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400">{title}</h1>
      </div>
      <div className="flex items-center gap-4">

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifs(v => !v)}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-white/5 rounded-xl transition-all relative"
            id="navbar-notifications-btn"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-900 animate-pulse" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-slide-up origin-top-right">
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-100">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-sky-400 hover:text-sky-300 font-medium">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
                {notifications.length === 0 ? (
                  <div className="p-6">
                    <EmptyState title="All Caught Up" description="No notifications right now." />
                  </div>
                ) : (
                  notifications.map(n => {
                    const url = getNotifUrl(n)
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotifClick(n)}
                        className={`p-4 transition-colors ${url ? 'cursor-pointer hover:bg-white/5' : 'cursor-default'} ${!n.is_read ? 'bg-sky-900/10' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1 flex-shrink-0">
                            {n.is_read
                              ? <CheckCircle2 size={14} className="text-slate-600" />
                              : <div className="w-2 h-2 rounded-full bg-sky-500" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm leading-snug ${!n.is_read ? 'text-slate-200 font-medium' : 'text-slate-400'}`}>
                              {n.message}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-slate-500">
                                {new Date(n.created_at).toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {url && <ExternalLink size={10} className="text-sky-600" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-white/10" />

        <Link to="/profile" className="flex items-center gap-3 group">
          <span className="hidden sm:block text-xs font-medium text-slate-400 group-hover:text-slate-200 transition-colors">
            {user?.full_name?.split(' ')[0]}
          </span>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-lg border border-white/10 group-hover:ring-2 ring-sky-500/50 transition-all">
            {user?.full_name?.[0] ?? '?'}
          </div>
        </Link>
      </div>
    </header>
  )
}
