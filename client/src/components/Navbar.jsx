import { useAuth } from '../context/AuthContext'
import { useAlerts } from '../context/AlertContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LogOut, Sun, Moon, Bell } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import NotificationPanel from './NotificationPanel'

const PAGE_TITLES = {
    '/dashboard': 'Dashboard', '/assets': 'Assets', '/tickets': 'Tickets',
    '/projects': 'Projects', '/tasks': 'Tasks',
    '/knowledge-base': 'Knowledge Base', '/user': 'Users', '/sessions': 'Sessions',
    '/alerts': 'Alert History',
}

export default function Navbar() {
    const { user, logout } = useAuth()
    const { bellCount, panelOpen, setPanelOpen } = useAlerts()
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
    const bellRef = useRef(null)

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark)
        localStorage.setItem('theme', dark ? 'dark' : 'light')
    }, [dark])

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <header className="app-navbar" style={{ position: 'relative' }}>
            <span className="app-navbar-page">{PAGE_TITLES[pathname] ?? 'IT Productivity'}</span>
            <span className="app-navbar-user">{user?.email}</span>

            {/* Bell button */}
            <div style={{ position: 'relative' }} ref={bellRef}>
                <Button
                    variant="ghost"
                    size="sm"
                    className="app-navbar-logout"
                    onClick={() => setPanelOpen(o => !o)}
                    title="Notifications"
                    style={{ position: 'relative' }}
                >
                    <Bell size={13} />
                    {bellCount > 0 && (
                        <span className="bell-badge">{bellCount > 99 ? '99+' : bellCount}</span>
                    )}
                </Button>
                <NotificationPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
            </div>

            <Button variant="ghost" size="sm" className="app-navbar-logout" onClick={() => setDark(d => !d)} title="Toggle theme">
                {dark ? <Sun size={13} /> : <Moon size={13} />}
            </Button>
            <Button variant="ghost" size="sm" className="app-navbar-logout" onClick={handleLogout}>
                <LogOut size={13} /> Logout
            </Button>
        </header>
    )
}
