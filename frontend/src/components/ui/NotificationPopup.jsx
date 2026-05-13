import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, X, ArrowRight } from 'lucide-react'
import client from '../../api/client'

// Map notification types to navigation URLs
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

/**
 * NotificationPopup — shows unread notifications as dismissible pop-ups
 * after login. Renders up to 3 at a time, stacked.
 */
export default function NotificationPopup({ notifications, onMarkRead, onDismissAll }) {
  const navigate = useNavigate()
  const [visible, setVisible] = useState([])
  const shownRef = useRef(new Set())

  useEffect(() => {
    // Show up to 3 unread notifications that haven't been shown yet
    const unread = notifications
      .filter(n => !n.is_read && !shownRef.current.has(n.id))
      .slice(0, 3)
    
    if (unread.length === 0) return

    unread.forEach(n => shownRef.current.add(n.id))
    setVisible(unread)

    // Auto-dismiss after 6 seconds
    const timer = setTimeout(() => setVisible([]), 6000)
    return () => clearTimeout(timer)
  }, [notifications])

  const dismiss = (id) => {
    setVisible(prev => prev.filter(n => n.id !== id))
  }

  const handleClick = async (notif) => {
    const url = getNotifUrl(notif)
    dismiss(notif.id)
    onMarkRead(notif.id)
    if (url) navigate(url)
  }

  if (visible.length === 0) return null

  return (
    <div className="fixed top-20 right-4 z-[200] flex flex-col gap-3 pointer-events-none">
      {visible.map((notif, idx) => {
        const url = getNotifUrl(notif)
        return (
          <div
            key={notif.id}
            className="pointer-events-auto animate-slide-up"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="w-80 bg-slate-900/95 backdrop-blur-xl border border-sky-500/30 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
              {/* Top accent bar */}
              <div className="h-0.5 bg-gradient-to-r from-sky-500 to-indigo-500" />
              
              <div className="p-4 flex items-start gap-3">
                {/* Icon */}
                <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bell size={16} className="text-sky-400" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-sky-400 uppercase tracking-wide mb-0.5">
                    New Notification
                  </p>
                  <p className="text-sm text-slate-200 leading-snug line-clamp-2">
                    {notif.message}
                  </p>
                  {url && (
                    <button
                      onClick={() => handleClick(notif)}
                      className="mt-2 flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors group"
                    >
                      View details <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>

                {/* Dismiss */}
                <button
                  onClick={() => dismiss(notif.id)}
                  className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0 mt-0.5"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
