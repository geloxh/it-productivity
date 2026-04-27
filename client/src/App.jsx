import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'

const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Assets = lazy(() => import('./pages/Assets'))

const Tickets = lazy(() => import('./pages/Tickets'))
const SubmitTicket = lazy(() => import('./pages/SubmitTicket'))
const Landing = lazy(() => import('./pages/Landing'))

const PublicOnlyRoute = lazy(() => import('./components/PublicOnlyRoute'))

const Projects = lazy(() => import('./pages/Projects'))
const Task = lazy(() => import('./pages/Task'))
const KnowledgeBase = lazy(() => import('./pages/KnowledgeBase'))
const User = lazy(() => import('./pages/User'))
const Sessions = lazy(() => import('./pages/Sessions'))

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="flex items-center justify-center min-h-svh">Loading...</div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/public" element={<Landing />} />
            <Route path="/submit-ticket" element={<SubmitTicket />} />

            <Route element={<PublicOnlyRoute />}>
              <Route path="/public" element={<Landing />} />
              <Route path="/submit-ticket" element={<SubmitTicket />} />
            </Route>
            
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
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}