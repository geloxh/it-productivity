import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

const PAGE_TITLES = {
    '/': 'Dashboard', '/assets': 'Assets', '/tickets': 'Tickets',
    '/projects': 'Projects', '/tasks': 'Tasks',
    '/knowledge-base': 'Knowledge Base', '/user': 'Users', '/sessions': 'Sessions'
}

export default function Navbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const { pathname } = useLocation()

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <header className="app-navbar">
            <span className="app-navbar-page">{PAGE_TITLES[pathname] ?? 'IT Productivity'}</span>
            <span className="app-navbar-user">{user?.email}</span>
            <Button variant="ghost" size="sm" className="app-navbar-logout" onClick={handleLogout}>
                <LogOut size={13} /> Logout
            </Button>
        </header>
    )
}
