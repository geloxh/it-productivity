import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

export default function DashboardLayout() {
    const [collapsed, setCollapsed] = useState(false)

    return (
        <div className="layout">
            <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
            <div className="layout-main">
                <Navbar />
                <main className="layout-content">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
