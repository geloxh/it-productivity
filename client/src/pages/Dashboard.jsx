import { useCallback, useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardApi } from '../api/dashboard'
import { api } from '../api/index'
import { useData } from '../hooks/useData'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RefreshCw, Circle, Plus, Monitor, Ticket, FolderKanban, CheckSquare, Users, GripVertical, AlertTriangle, Clock, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import {
    DndContext, closestCenter, 
    PointerSensor, useSensor, 
    useSensors
} from '@dnd-kit/core'
import {
    SortableContext, verticalListSortingStrategy,
    useSortable, arrayMove
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const STATS = [
    { key: 'assets', label: 'Assets', icon: Monitor },
    { key: 'tickets', label: 'Tickets', icon: Ticket },
    { key: 'projects', label: 'Projects', icon: FolderKanban },
    { key: 'tasks', label: 'Tasks', icon: CheckSquare },
]

const PRIORITY_VARIANT = { 
    High: 'destructive', 
    Medium: 'outline', 
    Low: 'secondary', 
    Critical: 'destructive' 
}

const ASSET_STATUS_COLORS = { 
    Available: '#22c55e', 
    Assigned: '#3b82f6', 
    Maintenance: '#f59e0b', 
    Retired: '#6b7280', 
    Lost: '#ef4444' 
}

const ACTION_ICONS = { 
    create: '＋', 
    update: '✎', 
    delete: '✕', 
    login: '→', 
    logout: '←' 
}

const ACTION_COLORS = { 
    create: '#22c55e', 
    update: '#3b82f6', 
    delete: '#ef4444', 
    login: '#a78bfa', 
    logout: '#6b7280' 
}

// Role-based default widget order
const ROLE_WIDGETS = {
    SysAdmin: ['kpis', 'ticket-status', 'asset-health', 'aging', 'activity'],
    Admin: ['kpis', 'ticket-status', 'asset-health', 'aging', 'activity'],
    Employee: ['kpis', 'ticket-status', 'aging'],
    Guest: ['kpis', 'ticket-status'],
}

const WIDGET_LABELS = {
    'kpis': 'KPI Overview',
    'ticket-status': 'Ticket Status',
    'asset-health': 'Asset Health',
    'aging': 'Ticket Aging (SLA)',
    'activity': 'Activity Feed',
}

function getStoredOrder(role) {
    try {
        const stored = localStorage.getItem(`widget-order-${role}`)
        return stored ? JSON.parse(stored) : (ROLE_WIDGETS[role] ?? ROLE_WIDGETS.Employee)
    } catch { return ROLE_WIDGETS.Employee }
}

// Sortable widget wrapper
function SortableWidget({ id, children }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
    return (
        <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}>
            <div className="dash-subpanel" style={{ position: 'relative' }}>
                <button className="widget-drag-handle" {...attributes} {...listeners} title="Drag to reorder">
                    <GripVertical size={14} />
                </button>
                {children}
            </div>
        </div>
    )
}

export default function Dashboard() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const role = user?.role ?? 'Employee'

    const [syncTime, setSyncTime] = useState(null)
    const [quickAction, setQuickAction] = useState(null)
    const [form, setForm] = useState({})
    const [saving, setSaving] = useState(false)
    const [widgetOrder, setWidgetOrder] = useState(() => getStoredOrder(role))

    const fetcher = useCallback(() => dashboardApi.getOverview(), [])
    const widgetFetcher = useCallback(() => dashboardApi.getWidgets(), [])
    const healthFetcher = useCallback(() => dashboardApi.getHealth(), [])
    const activityFetcher= useCallback(() => dashboardApi.getActivity(), [])

    const { data, loading, reload } = useData(fetcher)
    const { data: widgets } = useData(widgetFetcher)
    const { data: health } = useData(healthFetcher)
    const { data: activity = [] } = useData(activityFetcher)

    useEffect(() => { if (!loading) setSyncTime(new Date().toLocaleTimeString()) }, [loading])

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

    const handleDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return
        const oldIndex = widgetOrder.indexOf(active.id)
        const newIndex = widgetOrder.indexOf(over.id)
        const next = arrayMove(widgetOrder, oldIndex, newIndex)
        setWidgetOrder(next)
        localStorage.setItem(`widget-order-${role}`, JSON.stringify(next))
    }

    const openQuickAction = (type) => { setForm({}); setQuickAction(type) }

    const handleQuickSubmit = async (e) => {
        e.preventDefault(); setSaving(true)
        try {
            if (quickAction === 'ticket') await api.post('/tickets', form)
            else if (quickAction === 'asset') await api.post('/assets', form)
            else if (quickAction === 'task') await api.post('/tasks', form)
            toast.success(`${quickAction} created.`)
            setQuickAction(null); reload()
        } catch (err) { toast.error(err.message) }
        finally { setSaving(false) }
    }

    const set    = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))
    const setVal = (key) => (v) => setForm(f => ({ ...f, [key]: v }))

    // Pinned KPI values
    const openTickets     = data?.tickets?.byStatus?.find(s => s._id === 'Open')?.count ?? 0
    const overdueTasks    = widgets?.overdueByAssignee
        ? Object.values(widgets.overdueByAssignee).flat().length : 0
    const warrantyExpiring= widgets?.warrantyExpiring ?? 0

    // Widget renderers
    const WIDGETS = {
        'kpis': (
            <>
                <div className="dash-section-label">Overview</div>
                {/* Pinned KPI alert cards */}
                <div className="kpi-pin-row">
                    <div className="kpi-pin-card" data-alert={openTickets > 0 ? 'true' : 'false'}>
                        <Ticket size={14} />
                        <span className="kpi-pin-val">{openTickets}</span>
                        <span className="kpi-pin-label">Open Tickets</span>
                    </div>
                    <div className="kpi-pin-card" data-crit={overdueTasks > 0 ? 'true' : 'false'}>
                        <Clock size={14} />
                        <span className="kpi-pin-val">{overdueTasks}</span>
                        <span className="kpi-pin-label">Overdue Tasks</span>
                    </div>
                    <div className="kpi-pin-card" data-alert={warrantyExpiring > 0 ? 'true' : 'false'}>
                        <ShieldAlert size={14} />
                        <span className="kpi-pin-val">{warrantyExpiring}</span>
                        <span className="kpi-pin-label">Expiring Warranties</span>
                    </div>
                </div>
                <div className="stat-grid">
                    {loading ? [...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-md" />) : <>
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
                    </>}
                </div>
            </>
        ),
        'ticket-status': data?.tickets?.byStatus?.length > 0 && (
            <>
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
            </>
        ),
        'asset-health': data?.assets?.byStatus?.length > 0 && (
            <>
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
            </>
        ),
        'aging': widgets?.aging && (
            <>
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
            </>
        ),
        'activity': (
            <>
                <div className="dash-section-label">Activity Feed</div>
                {activity.length === 0
                    ? <span className="dash-empty">No recent activity</span>
                    : activity.map((log, i) => (
                        <div key={log._id ?? i} className="activity-row">
                            <span className="activity-icon" style={{ color: ACTION_COLORS[log.action] ?? '#4a7fa5' }}>
                                {ACTION_ICONS[log.action] ?? '●'}
                            </span>
                            <span className="activity-body">
                                <span className="activity-user">
                                    {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                                </span>
                                {' '}{log.action}{' '}
                                <span className="activity-entity">{log.entity}</span>
                            </span>
                            <span className="activity-time">
                                {new Date(log.timeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))
                }
            </>
        ),
    }

    const visibleWidgets = widgetOrder.filter(id => id in WIDGETS && WIDGETS[id])

    return (
        <div className="dash-root">
            <div className="dash-toolbar">
                <span className="dash-title">Dashboard</span>
                <div className="dash-toolbar-right">
                    {syncTime && <span className="dash-sync-time">Last sync: {syncTime}</span>}
                    <Button size="sm" variant="outline" onClick={reload} disabled={loading}>
                        <RefreshCw size={13} className={loading ? 'spin' : ''} />
                    </Button>
                </div>
            </div>

            <div className="dash-quickbar">
                <span className="dash-section-label" style={{ alignSelf: 'center' }}>Quick Actions</span>
                <Button size="sm" variant="outline" onClick={() => openQuickAction('ticket')}><Plus size={12} />New Ticket</Button>
                <Button size="sm" variant="outline" onClick={() => openQuickAction('asset')}><Plus size={12} />Add Asset</Button>
                <Button size="sm" variant="outline" onClick={() => openQuickAction('task')}><Plus size={12} />New Task</Button>
            </div>

            <Dialog open={!!quickAction} onOpenChange={() => setQuickAction(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>
                            {quickAction === 'ticket' ? 'New Ticket' : quickAction === 'asset' ? 'Add Asset' : 'New Task'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleQuickSubmit} className="flex flex-col gap-3">
                        {quickAction === 'ticket' && <>
                            <Input placeholder="Title *" onChange={set('title')} required />
                            <Input placeholder="Description" onChange={set('description')} />
                            <Select onValueChange={setVal('priority')} defaultValue="Medium">
                                <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                                <SelectContent>{['Low','Medium','High','Critical'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                            </Select>
                        </>}
                        {quickAction === 'asset' && <>
                            <Input placeholder="Asset Tag *" onChange={set('assetTag')} required />
                            <Input placeholder="Name / Label *" onChange={set('name')} required />
                            <Input placeholder="User" onChange={set('user')} />
                        </>}
                        {quickAction === 'task' && <>
                            <Input placeholder="Title *" onChange={set('title')} required />
                            <Input placeholder="Assigned To" onChange={set('assignedTo')} />
                            <Select onValueChange={setVal('priority')} defaultValue="Medium">
                                <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                                <SelectContent>{['Low','Medium','High'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                            </Select>
                        </>}
                        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create'}</Button>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="dash-panels">
                <div className="dash-panel-main">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={visibleWidgets} strategy={verticalListSortingStrategy}>
                            {visibleWidgets.map(id => (
                                <SortableWidget key={id} id={id}>
                                    {WIDGETS[id]}
                                </SortableWidget>
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>

                <div className="dash-panel-side">
                    <div className="dash-section-label">System Status</div>
                    <div className="dash-status-list">
                        {[
                            { label: 'API Server', ok: health?.ok ?? false },
                            { label: 'Database',   ok: health?.ok ?? false },
                            { label: 'Auth Service',ok: health?.ok ?? false },
                        ].map(s => (
                            <div key={s.label} className="dash-status-row">
                                <Circle size={8} fill={s.ok ? '#22c55e' : '#ef4444'} color={s.ok ? '#22c55e' : '#ef4444'} />
                                <span>{s.label}</span>
                                <span className="dash-status-badge" data-ok={String(s.ok)}>{s.ok ? 'Online' : 'Down'}</span>
                            </div>
                        ))}
                    </div>

                    <div className="dash-section-label" style={{ marginTop: 16 }}>Recent Open Tickets</div>
                    <div className="dash-feed">
                        {loading ? <Skeleton className="h-20" /> :
                            !widgets?.recentTickets?.length
                                ? <span className="dash-empty">No open tickets</span>
                                : widgets.recentTickets.map(t => (
                                    <div key={t._id} className="dash-feed-row" onClick={() => navigate('/tickets')} title="Go to Tickets">
                                        <Badge variant={PRIORITY_VARIANT[t.priority]} className="shrink-0">{t.priority}</Badge>
                                        <span className="dash-feed-title">{t.title}</span>
                                    </div>
                                ))
                        }
                    </div>

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
                </div>
            </div>

            <div className="dash-statusbar">
                <span>IT Productivity · {role}</span>
                <span>{syncTime ? `Updated ${syncTime}` : 'Loading...'}</span>
            </div>
        </div>
    )
}
