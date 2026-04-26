import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Monitor, Ticket, FolderKanban, CheckSquare, BookOpen, Users, Shield, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

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

export default function Sidebar({ collapsed, onToggle }) {
    return (
        <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
            <div className="sidebar-header">
                {!collapsed && <div className="sidebar-logo">IT Productivity</div>}
                <button className="sidebar-toggle" onClick={onToggle} title="Toggle sidebar">
                    {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                </button>
            </div>
            <nav>
                {links.map(({ to, label, icon: Icon }) => (
                    <NavLink key={to} to={to} end className={({ isActive }) => isActive ? 'active' : ''} title={collapsed ? label : undefined}>
                        <Icon size={16} />
                        {!collapsed && label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    )
}