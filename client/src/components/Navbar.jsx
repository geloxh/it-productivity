import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
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
        <header className="navbar">
            <span className="navbar-title">{PAGE_TITLES[pathname] ?? 'IT Productivity'}</span>
            <span className="text-sm text-muted-foreground" style={{ flex: 1 }}>{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut size={14} /> Logout
            </Button>
            <a href="/submit-ticket" target="_blank" style={{ fontSize: '14px', color: '#666' }}>
                Public Ticket Form
            </a>
        </header>
    )
}