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
        <aside className={`app-sidebar ${collapsed ? 'app-sidebar-collapsed' : ''}`}>
            <div className="app-sidebar-header">
                {!collapsed && (
                    <div className="app-sidebar-brand">
                        <div className="auth-logo-box">IT</div>
                        <span className="app-sidebar-title">IT Productivity</span>
                    </div>
                )}
                <button className="app-sidebar-toggle" onClick={onToggle} title="Toggle sidebar">
                    {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
                </button>
            </div>
            <nav className="app-sidebar-nav">
                {links.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to} to={to} end
                        className={({ isActive }) => `app-sidebar-link${isActive ? ' active' : ''}`}
                        title={collapsed ? label : undefined}
                    >
                        <Icon size={15} />
                        {!collapsed && <span>{label}</span>}
                    </NavLink>
                ))}
            </nav>
        </aside>
    )
}