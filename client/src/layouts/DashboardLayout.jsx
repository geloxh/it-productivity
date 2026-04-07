import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

export default function DashboardLayout() {
    return (
        <div className="layout">
            <Sidebar />
            <div className="layout-main">
                <Navbar />
                <main className="layout-content">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}