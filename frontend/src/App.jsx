import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Sidebar from './components/layout/Sidebar'
import Navbar  from './components/layout/Navbar'
import Spinner from './components/ui/Spinner'
import NotificationPopup from './components/ui/NotificationPopup'
import { Toaster } from 'sonner'
import { useNotifications } from './hooks/useNotifications'

import Landing          from './pages/Landing'
import Login            from './pages/Login'
import Register         from './pages/Register'
import Dashboard        from './pages/Dashboard'
import PostDetail       from './pages/PostDetail'
import CreatePost       from './pages/CreatePost'
import MyPosts          from './pages/MyPosts'
import MeetingRequests  from './pages/MeetingRequests'
import AdminDashboard   from './pages/AdminDashboard'
import ProfileSettings  from './pages/ProfileSettings'

// AppShell wraps the authenticated layout and fetches notifications globally
function AppShell() {
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { notifications, setNotifications, markRead } = useNotifications(user)

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden relative">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar notifications={notifications} setNotifications={setNotifications} setMobileOpen={setMobileOpen} />
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
      {/* Global notification popups */}
      <NotificationPopup
        notifications={notifications}
        onMarkRead={markRead}
        onDismissAll={() => {}}
      />
    </div>
  )
}

function Protected({ adminOnly = false, children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <Spinner size="lg" />
    </div>
  )
  if (!user) return <Navigate to="/" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster theme="dark" richColors position="bottom-right" />
      <Routes>
        <Route path="/"         element={<Landing />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<Protected><AppShell /></Protected>}>
          <Route path="dashboard"       element={<Dashboard />} />
          <Route path="posts/create"    element={<CreatePost />} />
          <Route path="posts/:id"       element={<PostDetail />} />
          <Route path="posts/:id/edit"  element={<CreatePost />} />
          <Route path="my-posts"        element={<MyPosts />} />
          <Route path="meetings"        element={<MeetingRequests />} />
          <Route path="profile"         element={<ProfileSettings />} />
          <Route path="admin" element={
            <Protected adminOnly><AdminDashboard /></Protected>
          } />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
