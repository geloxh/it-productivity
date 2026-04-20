import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Monitor, Ticket, FolderKanban, CheckSquare, BookOpen, Users, Shield } from 'lucide-react'

const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/assets', label: 'Assets', icon: Monitor },
    { to: '/tickets', label: 'Tickets', icon: Ticket },
    { to: '/projects', label: 'Projects', icon: FolderKanban },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
    { to: '/user', label: 'Users', icon: Users },
    { to: '/sessions', label: 'Sessions', icon: Shield },
]

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">IT Productivity</div>
            <nav>
                {links.map(({ to, label, icon: Icon }) => (
                    <NavLink key={to} to={to} end className={({ isActive }) => isActive ? 'active' : ''}>
                        <Icon size={16} />
                        {label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    )
}