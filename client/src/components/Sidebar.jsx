import { NavLink } from 'react-router-dom'

const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/assets', label: 'Assets' },
    { to: 'tickets', label: 'Tickets' },
    { to: '/projects', label: 'Projects' },
    { to: '/tasks', label: 'Tasks' },
    { to: '/knowledge-base', label: 'Knowledge-Base' },
    { to: '/users', label: 'Users' },
    { to: '/sessions', label: 'Sessions' },
]

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">IT Productivity</div>
            <nav>
                {links.map(({ to, label }) => (
                    <NavLink key={to} to={to} end className={({ isActive }) => isActive ? 'active' : ''}>
                        {label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    )
}