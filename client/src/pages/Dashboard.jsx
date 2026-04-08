import { useEffect, useState } from 'react'
import { dashboardApi } from '../api/dashboard'

const STATS = [
    { key: 'assets', label: 'Assets' },
    { key: 'tickets', label: 'Tickets' },
    { key: 'projects', label: 'Projects' },
    { key: 'tasks', label: 'Tasks' },
]

export default function Dashboard() {
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        dashboardApi.getOverview()
            .then(setData)
            .catch(() => setError('Failed to load dashboard.'))
    }, [])

    if (error) return <p className="error">{error}</p>
    if (!data) return <p>Loading...</p>

    return (
        <div>
            <h2>Dashboard</h2>
            <div className="stat-grid">
                {STATS.map(({ key, label }) => (
                    <div key={key} className="stat-card">
                        <span className="stat-label">{label}</span>
                        <span className="stat-value">
                            {key === 'tasks' ? data.tasks?.total : data[key]?.total ?? 0}
                        </span>
                    </div>
                ))}
                <div className="stat-card">
                    <span className="stat-label">Active Users</span>
                    <span className="stat-value">{data.users?.active ?? 0}</span>
                </div>
            </div>
        </div>
    )
}