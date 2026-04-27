import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
    const { user } = useAuth()
    if (user === undefined) return null // still loading
    return user ? <Outlet /> : <Navigate to="/login" replace />
}