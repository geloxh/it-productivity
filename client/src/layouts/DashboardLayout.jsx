import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import AlertBanner from '../components/AlertBanner'
import { AlertProvider } from '../context/AlertContext'

export default function DashboardLayout() {
    const [collapsed, setCollapsed] = useState(false)

    return (
        <AlertProvider>
            <div className="app-window">
                <div className="app-titlebar">
                    <span className="app-titlebar-icon">⚙</span>
                    <span className="app-titlebar-text">IT Productivity — Management System</span>
                    <div className="app-titlebar-controls">
                        <span /><span /><span />
                    </div>
                </div>
                {/* P1 alerts render above everything */}
                <AlertBanner />
                <div className="layout">
                    <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
                    <div className="layout-main">
                        <Navbar />
                        <main className="layout-content">
                            <Outlet />
                        </main>
                    </div>
                </div>
                <div className="app-statusbar">
                    <span>● System Online</span>
                    <span>v1.0.0</span>
                </div>
            </div>
        </AlertProvider>
    )
}
