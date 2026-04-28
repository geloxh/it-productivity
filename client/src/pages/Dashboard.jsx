import { useEffect, useState } from 'react'
import { dashboardApi } from '../api/dashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { Monitor, Ticket, FolderKanban, CheckSquare, Users, RefreshCw, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const STATS = [
    { key: 'assets', label: 'Assets', icon: Monitor },
    { key: 'tickets', label: 'Tickets', icon: Ticket },
    { key: 'projects', label: 'Projects', icon: FolderKanban},
    { key: 'tasks', label: 'Tasks', icon: CheckSquare },
]

export default function Dashboard() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [lastSync, setLastSync] = useState(null)

    const load = () => {
        setLoading(true)
        dashboardApi.getOverview()
            .then(d => { setData(d); setLastSync(new Date) })
            .finally(() => setLoading(false))
    }

    useEffect(load, [])

    return (
        <div className="dash-root">
            {/** Toolbar */}
            <div className="dash-toolbar">
                <span className="dash-title">Dashboard</span>
                <div className="dash-toolbar-right">
                    {lastSync && <span className="dash-sync-time">Synced {lastSync.toLocaleTimeString()}</span>}
                    <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
                        <RefreshCw size={13} className={loading ? 'spin' : ''} />
                    </Button>
                </div>
            </div>

            {/** Main Panels */}
            <div className="dash-panels">
                {/** Left: Stats */}
                <div className="dash-panel-main">
                    <div className="dash-section-label">Overview</div>
                    <div className="stat-grid">
                        {loading ? [...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-md" />)
                            : <>
                                {STATS.map(({ key, label, icon: Icon }) => (
                                    <div key={key} className="stat-card">
                                        <span className="stat-label flex items-center gap-1.5"><Icon size={13} />{label}</span>
                                        <span className="stat-value">
                                            {key  === 'tasks' ? data?.tasks?.total : data?.[key]?.total ?? 0}
                                        </span>
                                    </div>
                                ))}
                                <div className="stat-card">
                                    <span className="stat-label flex items-center gap-1.5"><Users size={13} />Active Users</span>
                                    <span className="stat-value">{data?.users?.active ?? 0}</span>
                                </div>
                            </>
                        }
                    </div>
                    
                    {/** Ticket Breakdown Sub-panel */}
                    {!loading && data?.tickets?.byStatus?.length > 0 && (
                        <div className="dash-subpanel">
                            <div className="dash-section-label">Ticket Status</div>
                            <div className="dash-breakdown">
                                {data.tickets.byStatus.map(({ _id, count }) => (
                                    <div key={_id} className="dash-breakdown-row">
                                        <span className="dash-breakdown-key">{_id}</span>
                                        <div className="dash-breakdown-bar-wrap">
                                            <div className="dash-breakdown-bar" style={{ width: `${Math.min((count / data.tickets.total) * 100, 100)}%` }} />
                                        </div>
                                        <span className="dash-breakdown-val">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/** Right: Activity Feed */}
                <div className="dash-panel-side">
                    <div className="dash-section-label">System Status</div>
                    <div className="dash-status-list">
                        {[
                            { label: 'API Server', ok: true },
                            { label: 'Database', ok: true },
                            { label: 'Auth Service', ok: true },
                        ].map(s => (
                            <div key={s.label} className="dash-status-row">
                                <Circle size={8} fill={s.ok ? '#22c55e' : '#ef4444'} color={s.ok ? '#22c55e' : '#ef4444'} />
                                <span>{s.label}</span>
                                <span className="dash-status-badge" data-ok={s.ok}>{s.ok ? 'Online' : 'Down'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/** Status bar */}
            <div className="dash-statusbar">
                <span>IT Productivity</span>
                <span>{loading ? 'Loading...' : `${(data?.assets?.total ?? 0) + (data?.tickets?.total ?? 0)} total records` }</span>
            </div>
        </div>
    )
}