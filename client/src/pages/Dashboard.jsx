import { useEffect, useState } from 'react'
import { dashboardApi } from '../api/dashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { Monitor, Ticket, FolderKanban, CheckSquare, Users } from 'lucide-react'

const STATS = [
    { key: 'assets', label: 'Assets', icon: Monitor },
    { key: 'tickets', label: 'Tickets', icon: Ticket },
    { key: 'projects', label: 'Projects', icon: FolderKanban},
    { key: 'tasks', label: 'Tasks', icon: CheckSquare },
]

export default function Dashboard() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        dashboardApi.getOverview()
            .then(setData)
            .finally(() => setLoading(false))
    }, [])

    if (loading) return (
        <div>
            <h2>Dashboard</h2>
            <div className="stat-grid">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
            </div>
        </div>
    )

    return (
        <div>
            <h2>Dashboard</h2>
            <div className="stat-grid">
                {STATS.map(({ key, label, icon: Icon }) => (
                    <div key={key} className="stat-card">
                        <span className="stat-label flex items-center gap-1.5"><Icon size={13} />{label}</span>
                        <span className="stat-value">
                            {key === 'tasks' ? data?.tasks?.total : data?.[key]?.total ?? 0}
                        </span>
                    </div>
                ))}
                <div className="stat-card">
                    <span className="stat-label flex items-center gap-1.5"><Users size={13} />Active Users</span>
                    <span className="stat-value">{data?.users?.active ?? 0}</span>
                </div>
            </div>
        </div>
    )
}