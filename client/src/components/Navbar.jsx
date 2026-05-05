import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LogOut, Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

const PAGE_TITLES = {
    '/dashboard': 'Dashboard', '/assets': 'Assets', '/tickets': 'Tickets',
    '/projects': 'Projects', '/tasks': 'Tasks',
    '/knowledge-base': 'Knowledge Base', '/user': 'Users', '/sessions': 'Sessions'
}

export default function Navbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark)
        localStorage.setItem('theme', dark ? 'dark' : 'light')
    }, [dark])

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <header className="app-navbar">
            <span className="app-navbar-page">{PAGE_TITLES[pathname] ?? 'IT Productivity'}</span>
            <span className="app-navbar-user">{user?.email}</span>
            <Button variant="ghost" size="sm" className="app-navbar-logout" onClick={() => setDark(d => !d)} title="Toggle theme">
                {dark ? <Sun size={13} /> : <Moon size={13} />}
            </Button>
            <Button variant="ghost" size="sm" className="app-navbar-logout" onClick={handleLogout}>
                <LogOut size={13} /> Logout
            </Button>
        </header>
    )
}