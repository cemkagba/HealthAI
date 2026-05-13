import { useState, useEffect, useCallback } from 'react'
import client from '../api/client'

export function useNotifications(user) {
  const [notifications, setNotifications] = useState([])

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    try {
      const { data } = await client.get('/notifications')
      setNotifications(data)
    } catch (e) {
      console.error('Failed to fetch notifications silently', e)
    }
  }, [user])

  useEffect(() => {
    fetchNotifications()
    // Poll every 30 seconds
    const id = setInterval(fetchNotifications, 30_000)
    return () => clearInterval(id)
  }, [fetchNotifications])

  const markRead = useCallback(async (id) => {
    try {
      await client.patch(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch (e) {
      console.error(e)
    }
  }, [])

  return { notifications, setNotifications, markRead }
}
