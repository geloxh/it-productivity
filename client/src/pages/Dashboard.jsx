import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardApi } from '../api/dashboard'
import { api } from '../api/index'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Monitor, Ticket, FolderKanban, CheckSquare, Users, RefreshCw, Circle, Plus } from 'lucide-react'
import { toast } from 'sonner'

const STATS = [
    { key: 'assets', label: 'Assets', icon: Monitor },
    { key: 'tickets', label: 'Tickets', icon: Ticket },
    { key: 'projects', label: 'Projects', icon: FolderKanban },
    { key: 'tasks', label: 'Tasks', icon: CheckSquare },
]
const PRIORITY_VARIANT = { Low: 'secondary', Medium: 'outline', High: 'default', Critical: 'destructive' }
const ASSET_STATUS_COLORS = { Available: '#22c55e', Assigned: '#3b82f6', Maintenance: '#f59e0b', Retired: '#9ca3af', Lost: '#ef4444' }

export default function Dashboard() {
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [widgets, setWidgets] = useState(null)
    const [health, setHealth] = useState(null)
    const [loading, setLoading] = useState(true)
    const [lastSync, setLastSync] = useState(null)
    const [quickAction, setQuickAction] = useState(null) // 'ticket' | 'task' | 'asset'
    const [projects, setProjects] = useState([])
    const [form, setForm] = useState({})
    const [saving, setSaving] = useState(false)

    const load = () => {
        setLoading(true)
        Promise.all([
            dashboardApi.getOverview(),
            dashboardApi.getWidgets(),
            dashboardApi.getHealth(),
        ]).then(([overview, w, h]) => {
            setData(overview)
            setWidgets(w)
            setHealth(h)
            setLastSync(new Date())
        }).finally(() => setLoading(false))
    }

    useEffect(load, [])

    const openQuickAction = async (type) => {
        setForm({})
        setQuickAction(type)
        if (type === 'task' && projects.length === 0) {
            const d = await api.get('/projects').then(d => d.projects ?? d)
            setProjects(d)
        }
    }

    const submitQuickAction = async () => {
        setSaving(true)
        try {
            if (quickAction === 'ticket') await api.post('/tickets', { title: form.title, description: form.desc || '—', priority: form.priority || 'Low' })
            if (quickAction === 'asset') await api.post('/assets', { name: form.name, assetTag: form.tag, category: form.category || 'Laptop' })
            if (quickAction === 'task') await api.post('/tasks', { title: form.title, project: form.project, priority: form.priority || 'Medium' })
            toast.success('Created successfully.')
            setQuickAction(null)
            load()
        } catch (err) {
            toast.error(err.message)
        } finally {
            setSaving(false)
        }
    }

    const totalRecords = (data?.assets?.total ?? 0) + (data?.tickets?.total ?? 0)

    return (
        <div className="dash-root">
            {/* Toolbar */}
            <div className="dash-toolbar">
                <span className="dash-title">Dashboard</span>
                <div className="dash-toolbar-right">
                    {lastSync && <span className="dash-sync-time">Synced {lastSync.toLocaleTimeString()}</span>}
                    <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
                        <RefreshCw size={13} className={loading ? 'spin' : ''} />
                    </Button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="dash-quickbar">
                <span className="dash-section-label" style={{ alignSelf: 'center' }}>Quick Actions</span>
                <Button size="sm" variant="outline" onClick={() => openQuickAction('ticket')}><Plus size={12} />New Ticket</Button>
                <Button size="sm" variant="outline" onClick={() => openQuickAction('asset')}><Plus size={12} />Add Asset</Button>
                <Button size="sm" variant="outline" onClick={() => openQuickAction('task')}><Plus size={12} />New Task</Button>
            </div>

            {/* Main panels */}
            <div className="dash-panels">
                {/* Left column */}
                <div className="dash-panel-main">
                    {/* Stat cards */}
                    <div className="dash-section-label">Overview</div>
                    <div className="stat-grid">
                        {loading ? [...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-md" />)
                            : <>
                                {STATS.map(({ key, label, icon: Icon }) => (
                                    <div key={key} className="stat-card">
                                        <span className="stat-label flex items-center gap-1.5"><Icon size={13} />{label}</span>
                                        <span className="stat-value">{key === 'tasks' ? data?.tasks?.total : data?.[key]?.total ?? 0}</span>
                                    </div>
                                ))}
                                <div className="stat-card">
                                    <span className="stat-label flex items-center gap-1.5"><Users size={13} />Active Users</span>
                                    <span className="stat-value">{data?.users?.active ?? 0}</span>
                                </div>
                            </>
                        }
                    </div>

                    {/* Ticket status breakdown */}
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

                    {/* Asset health */}
                    {!loading && data?.assets?.byStatus?.length > 0 && (
                        <div className="dash-subpanel">
                            <div className="dash-section-label">Asset Health</div>
                            <div className="dash-breakdown">
                                {data.assets.byStatus.map(({ _id, count }) => (
                                    <div key={_id} className="dash-breakdown-row">
                                        <span className="dash-breakdown-key" style={{ color: ASSET_STATUS_COLORS[_id] }}>{_id}</span>
                                        <div className="dash-breakdown-bar-wrap">
                                            <div className="dash-breakdown-bar" style={{ width: `${Math.min((count / data.assets.total) * 100, 100)}%`, background: ASSET_STATUS_COLORS[_id] }} />
                                        </div>
                                        <span className="dash-breakdown-val">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Ticket aging / SLA */}
                    {!loading && widgets?.aging && (
                        <div className="dash-subpanel">
                            <div className="dash-section-label">Open Ticket Aging (SLA)</div>
                            <div className="dash-aging-row">
                                <div className="dash-aging-card" data-warn="true">
                                    <span className="dash-aging-val">{widgets.aging.gt3}</span>
                                    <span className="dash-aging-label">3 days open</span>
                                </div>
                                <div className="dash-aging-card" data-crit="true">
                                    <span className="dash-aging-val">{widgets.aging.gt7}</span>
                                    <span className="dash-aging-label">7 days open</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right column */}
                <div className="dash-panel-side">
                    {/* System status */}
                    <div className="dash-section-label">System Status</div>
                    <div className="dash-status-list">
                        {[
                            { label: 'API Server', ok: health?.ok ?? false },
                            { label: 'Database', ok: health?.ok ?? false },
                            { label: 'Auth Service', ok: health?.ok ?? false },
                        ].map(s => (
                            <div key={s.label} className="dash-status-row">
                                <Circle size={8} fill={s.ok ? '#22c55e' : '#ef4444'} color={s.ok ? '#22c55e' : '#ef4444'} />
                                <span>{s.label}</span>
                                <span className="dash-status-badge" data-ok={String(s.ok)}>{s.ok ? 'Online' : 'Down'}</span>
                            </div>
                        ))}
                    </div>

                    {/* Recent tickets */}
                    <div className="dash-section-label" style={{ marginTop: 16 }}>Recent Open Tickets</div>
                    <div className="dash-feed">
                        {loading ? <Skeleton className="h-20" /> :
                            widgets?.recentTickets?.length === 0
                                ? <span className="dash-empty">No open tickets</span>
                                : widgets?.recentTickets?.map(t => (
                                    <div key={t._id} className="dash-feed-row" onClick={() => navigate('/tickets')} title="Go to Tickets">
                                        <Badge variant={PRIORITY_VARIANT[t.priority]} className="shrink-0">{t.priority}</Badge>
                                        <span className="dash-feed-title">{t.title}</span>
                                    </div>
                                ))
                        }
                    </div>

                    {/* Overdue tasks */}
                    <div className="dash-section-label" style={{ marginTop: 16 }}>Overdue Tasks</div>
                    <div className="dash-feed">
                        {loading ? <Skeleton className="h-20" /> :
                            !widgets?.overdueByAssignee || Object.keys(widgets.overdueByAssignee).length === 0
                                ? <span className="dash-empty">No overdue tasks</span>
                                : Object.entries(widgets.overdueByAssignee).map(([assignee, tasks]) => (
                                    <div key={assignee} className="dash-overdue-group">
                                        <span className="dash-overdue-assignee">{assignee}</span>
                                        {tasks.map((t, i) => (
                                            <div key={i} className="dash-feed-row" onClick={() => navigate('/tasks')}>
                                                <Badge variant={PRIORITY_VARIANT[t.priority]} className="shrink-0">{t.priority}</Badge>
                                                <span className="dash-feed-title">{t.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                ))
                        }
                    </div>

                    {/* Announcements */}
                    <div className="dash-section-label" style={{ marginTop: 16 }}>Announcements</div>
                    <div className="dash-feed">
                        {loading ? <Skeleton className="h-20" /> :
                            widgets?.announcements?.length === 0
                                ? <span className="dash-empty">No announcements</span>
                                : widgets?.announcements?.map(a => (
                                    <div key={a._id} className="dash-feed-row" onClick={() => navigate('/knowledge-base')}>
                                        <Badge variant="outline" className="shrink-0">{a.category}</Badge>
                                        <span className="dash-feed-title">{a.title}</span>
                                    </div>
                                ))
                        }
                    </div>
                </div>
            </div>

            {/* Status bar */}
            <div className="dash-statusbar">
                <span>IT Productivity</span>
                <span>{loading ? 'Loading...' : `${totalRecords} total records`}</span>
            </div>

            {/* Quick Action Dialog */}
            <Dialog open={!!quickAction} onOpenChange={() => setQuickAction(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>
                            {quickAction === 'ticket' && 'New Ticket'}
                            {quickAction === 'asset' && 'Add Asset'}
                            {quickAction === 'task' && 'New Task'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-3">
                        {quickAction === 'ticket' && <>
                            <Input placeholder="Title *" onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                            <Input placeholder="Description" onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} />
                            <Select onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                                <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                                <SelectContent>{['Low','Medium','High','Critical'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                            </Select>
                        </>}
                        {quickAction === 'asset' && <>
                            <Input placeholder="Name *" onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                            <Input placeholder="Asset Tag *" onChange={e => setForm(f => ({ ...f, tag: e.target.value }))} />
                            <Select onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                                <SelectContent>{['Laptop','Desktop','Server','Network','Peripheral','Software','Mobile'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                            </Select>
                        </>}
                        {quickAction === 'task' && <>
                            <Input placeholder="Title *" onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                            <Select onValueChange={v => setForm(f => ({ ...f, project: v }))}>
                                <SelectTrigger><SelectValue placeholder="Project *" /></SelectTrigger>
                                <SelectContent>{projects.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}</SelectContent>
                            </Select>
                            <Select onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                                <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                                <SelectContent>{['Low','Medium','High','Critical'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                            </Select>
                        </>}
                        <Button onClick={submitQuickAction} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}