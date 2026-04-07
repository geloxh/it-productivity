import { NavLink } from 'react-router-dom'

const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/assets', label: 'ASsets' },
]

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">ITG Productivity</div>
            <nav>
                {links.map(({ to, label }) => (
                    <NavLink key={to} to={to} end className={({ isActive }) => isActive ? 'active' : ''}></NavLink>
                        {label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    )
}