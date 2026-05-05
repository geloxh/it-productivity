import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PublicOnlyRoute() {
    const { user } = useAuth()
    if (user === undefined) return null
    return user ? <Navigate to="/dashboard" replace /> : <Outlet />
}