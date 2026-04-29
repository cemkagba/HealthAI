import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Sidebar from './components/layout/Sidebar'
import Navbar  from './components/layout/Navbar'
import Spinner from './components/ui/Spinner'

import Login            from './pages/Login'
import Register         from './pages/Register'
import Dashboard        from './pages/Dashboard'
import PostDetail       from './pages/PostDetail'
import CreatePost       from './pages/CreatePost'
import MyPosts          from './pages/MyPosts'
import MeetingRequests  from './pages/MeetingRequests'
import AdminDashboard   from './pages/AdminDashboard'

function AppShell() {
  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
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
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<Protected><AppShell /></Protected>}>
          <Route path="dashboard"       element={<Dashboard />} />
          <Route path="posts/create"    element={<CreatePost />} />
          <Route path="posts/:id"       element={<PostDetail />} />
          <Route path="posts/:id/edit"  element={<CreatePost />} />
          <Route path="my-posts"        element={<MyPosts />} />
          <Route path="meetings"        element={<MeetingRequests />} />
          <Route path="admin" element={
            <Protected adminOnly><AdminDashboard /></Protected>
          } />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
