import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Assets from './pages/Assets'
import Tickets from './pages/Tickets'
import Projects from './pages/Projects'
import Task from './pages/Task'
import KnowledgeBase from './pages/KnowledgeBase'
import User from './pages/User'
import Sessions from './pages/Sessions'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/assets" element={<Assets />} />
              <Route path="/tickets" element={<Tickets />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/tasks" element={<Task />} />
              <Route path="/knowledge-base" element={<KnowledgeBase />} />
              <Route path="/user" element={<User />} />
              <Route path="/sessions" element={<Sessions />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
