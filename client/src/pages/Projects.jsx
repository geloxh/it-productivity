import { useState, useCallback, useEffect } from 'react'
import { api } from '../api/index'
import { useData } from '../hooks/useData'
import { useElectron } from '../context/ElectronContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']
const STATUSES   = ['Planning', 'Active', 'Pending', 'Completed', 'Cancelled']

const PRIORITY_VARIANT = { Low: 'secondary', Medium: 'outline', High: 'default', Critical: 'destructive' }
const STATUS_COLOR = {
    Planning:  { bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd' },
    Active:    { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
    Pending:   { bg: '#fefce8', color: '#a16207', border: '#fde68a' },
    Completed: { bg: '#f0fdf4', color: '#166534', border: '#86efac' },
    Cancelled: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
}

const EMPTY = {
    name: '', description: '', priority: 'Medium',
    startDate: '', endDate: '', members: []
}

// Deterministic avatar color from a string
function avatarColor(str = '') {
    const colors = ['#0284c7','#7c3aed','#db2777','#ea580c','#16a34a','#ca8a04','#0891b2']
    let h = 0
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff
    return colors[Math.abs(h) % colors.length]
}

function Avatar({ user, size = 24 }) {
    const name = user?.firstName
        ? `${user.firstName} ${user.lastName}`
        : user?.email ?? '?'
    const initials = user?.firstName
        ? `${user.firstName[0]}${user.lastName?.[0] ?? ''}`.toUpperCase()
        : (user?.email?.[0] ?? '?').toUpperCase()
    return (
        <span
            title={name}
            style={{
                width: size, height: size, borderRadius: '50%',
                background: avatarColor(name),
                color: '#fff', fontSize: size * 0.42,
                fontWeight: 700, fontFamily: 'var(--mono)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, border: '2px solid #fff',
            }}
        >
            {initials}
        </span>
    )
}

function ProgressBar({ done, total }) {
    const pct = total > 0 ? Math.round((done / total) * 100) : 0
    const color = pct === 100 ? '#16a34a' : pct >= 50 ? '#0284c7' : '#f59e0b'
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ flex: 1, height: 5, background: '#e0f2fe', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.4s' }} />
            </div>
            <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: '#7ab8d4', flexShrink: 0 }}>
                {done}/{total}
            </span>
        </div>
    )
}

function StatusPill({ status }) {
    const s = STATUS_COLOR[status] ?? STATUS_COLOR.Planning
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 7px', borderRadius: 999, fontSize: 11,
            fontFamily: 'var(--mono)', fontWeight: 500,
            background: s.bg, color: s.color, border: `1px solid ${s.border}`,
        }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color }} />
            {status}
        </span>
    )
}

function OverdueBadge() {
    return (
        <span style={{
            display: 'inline-block', padding: '1px 5px', borderRadius: 3,
            fontSize: 10, fontFamily: 'var(--mono)', fontWeight: 700,
            background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
            textTransform: 'uppercase', letterSpacing: '0.4px',
        }}>overdue</span>
    )
}

// ── Project Card (card view) ──────────────────────────────────────────────────
function ProjectCard({ project, onStatusChange, onDelete }) {
    const dueDate = project.endDate ? new Date(project.endDate) : null
    const dueFmt  = dueDate ? dueDate.toLocaleDateString() : null

    return (
        <div className={`proj-card${project.isOverdue ? ' proj-card-overdue' : ''}`}>
            <div className="proj-card-header">
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span className="proj-card-name">{project.name}</span>
                        {project.isOverdue && <OverdueBadge />}
                    </div>
                    {project.description && (
                        <p className="proj-card-desc">{project.description}</p>
                    )}
                </div>
                <StatusPill status={project.status} />
            </div>

            {/* Progress */}
            <div style={{ margin: '8px 0 4px' }}>
                <ProgressBar done={project.taskDone} total={project.taskTotal} />
                {project.overdueTaskCount > 0 && (
                    <span style={{ fontSize: 10, color: '#dc2626', fontFamily: 'var(--mono)' }}>
                        {project.overdueTaskCount} overdue task{project.overdueTaskCount !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            <div className="proj-card-footer">
                {/* Member avatars */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {(project.members ?? []).slice(0, 5).map((m, i) => (
                        <span key={m._id ?? i} style={{ marginLeft: i > 0 ? -6 : 0, zIndex: 5 - i }}>
                            <Avatar user={m} size={22} />
                        </span>
                    ))}
                    {(project.members ?? []).length > 5 && (
                        <span style={{
                            marginLeft: -6, width: 22, height: 22, borderRadius: '50%',
                            background: '#e0f2fe', color: '#0369a1', fontSize: 9,
                            fontFamily: 'var(--mono)', fontWeight: 700,
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            border: '2px solid #fff',
                        }}>
                            +{project.members.length - 5}
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {dueFmt && (
                        <span style={{
                            fontSize: 11, fontFamily: 'var(--mono)',
                            color: project.isOverdue ? '#dc2626' : '#7ab8d4',
                        }}>
                            📅 {dueFmt}
                        </span>
                    )}
                    <Badge variant={PRIORITY_VARIANT[project.priority]}>{project.priority}</Badge>
                </div>
            </div>

            <div className="proj-card-actions">
                <Select value={project.status} onValueChange={v => onStatusChange(project._id, v)}>
                    <SelectTrigger className="status-select" style={{ height: 26, fontSize: 11 }}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" style={{ height: 26, fontSize: 11 }}>Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <p>Delete <strong>{project.name}</strong>? This cannot be undone.</p>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(project._id)}>Delete</AlertDialogAction>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    )
}

// ── Workload Panel ────────────────────────────────────────────────────────────
function WorkloadPanel({ open }) {
    const fetcher = useCallback(() => api.get('/tasks/workload'), [])
    const { data: workload = [], loading } = useData(fetcher)

    if (!open) return null
    const max = workload[0]?.openTasks ?? 1

    return (
        <div className="proj-workload-panel">
            <div className="dash-section-label" style={{ marginBottom: 8 }}>Member Workload — Open Tasks</div>
            {loading && <div className="page-skeleton">{[...Array(4)].map((_, i) => <Skeleton key={i} style={{ height: 24 }} />)}</div>}
            {!loading && workload.length === 0 && (
                <span className="dash-empty">No assigned tasks found.</span>
            )}
            {!loading && workload.map(row => {
                const name = row.user?.firstName
                    ? `${row.user.firstName} ${row.user.lastName}`
                    : row.user?.email ?? 'Unknown'
                const pct = Math.round((row.openTasks / max) * 100)
                const warn = row.openTasks >= 8
                return (
                    <div key={row._id} className="proj-workload-row">
                        <Avatar user={row.user} size={20} />
                        <span className="proj-workload-name">{name}</span>
                        <div style={{ flex: 1, height: 5, background: '#e0f2fe', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{
                                width: `${pct}%`, height: '100%', borderRadius: 3,
                                background: warn ? '#ef4444' : '#0284c7',
                                transition: 'width 0.4s',
                            }} />
                        </div>
                        <span style={{
                            fontSize: 11, fontFamily: 'var(--mono)', fontWeight: 600,
                            color: warn ? '#dc2626' : '#0369a1', flexShrink: 0,
                        }}>
                            {row.openTasks}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Projects() {
    const fetcher = useCallback(() => api.get('/projects/stats'), [])
    const usersFetcher = useCallback(() => api.get('/users'), [])
    const { data: projects = [], loading, reload } = useData(fetcher)
    const { data: users = [] } = useData(usersFetcher)

    const { openPanel, isElectron } = useElectron()

    // Reload when Electron panel signals completion
    useEffect(() => {
        const handler = () => {
            if (localStorage.getItem('panel:reload') === 'projects') {
                localStorage.removeItem('panel:reload')
                reload()
            }
        }
        window.addEventListener('storage', handler)
        return () => window.removeEventListener('storage', handler)
    }, [reload])

    const [form, setForm]           = useState(EMPTY)
    const [showForm, setShowForm]   = useState(false)
    const [saving, setSaving]       = useState(false)
    const [search, setSearch]       = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [viewMode, setViewMode]   = useState('card') // 'card' | 'list'
    const [showWorkload, setShowWorkload] = useState(false)

    const hasFilters = search || filterStatus !== 'all'

    const handleAddClick = () => {
        if (isElectron && openPanel) {
            openPanel({ route: '/panel/projects/new', width: 860, height: 680, title: 'New Project' })
        } else {
            setShowForm(true)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true)
        try {
            const payload = {
                name: form.name,
                description: form.description || undefined,
                priority: form.priority,
                members: form.members,
                startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
                endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
            }
            await api.post('/projects', payload)
            toast.success('Project created.')
            setForm(EMPTY); setShowForm(false); reload()
        } catch (err) { toast.error(err.message) }
        finally { setSaving(false) }
    }

    const handleDelete = async (id) => {
        try { await api.delete(`/projects/${id}`); toast.success('Project deleted.'); reload() }
        catch (err) { toast.error(err.message) }
    }

    const handleStatusChange = async (id, status) => {
        try { await api.put(`/projects/${id}`, { status }); reload() }
        catch (err) { toast.error(err.message) }
    }

    const toggleMember = (uid) => {
        setForm(f => ({
            ...f,
            members: f.members.includes(uid)
                ? f.members.filter(id => id !== uid)
                : [...f.members, uid]
        }))
    }

    const filtered = projects.filter(p => {
        const matchText = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.description?.toLowerCase().includes(search.toLowerCase())
        const matchStatus = filterStatus === 'all' || p.status === filterStatus
        return matchText && matchStatus
    })

    return (
        <div className="assets-root">
            <div className="dash-toolbar">
                <span className="dash-title">
                    Projects
                    {projects.length > 0 && (
                        <span className="dash-title-count">
                            ({projects.filter(p => p.status === 'Active').length} active)
                        </span>
                    )}
                </span>
                <div className="dash-toolbar-right">
                    <Input
                        placeholder="Search projects..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="assets-search"
                    />
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="filter-select"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    {hasFilters && (
                        <Button size="sm" variant="ghost" onClick={() => { setSearch(''); setFilterStatus('all') }}>
                            ✕ Clear
                        </Button>
                    )}
                    {/* View toggle */}
                    <div className="assets-view-toggle">
                        <button
                            className={`view-btn${viewMode === 'card' ? ' active' : ''}`}
                            onClick={() => setViewMode('card')} title="Card view"
                        >⊞</button>
                        <button
                            className={`view-btn${viewMode === 'list' ? ' active' : ''}`}
                            onClick={() => setViewMode('list')} title="List view"
                        >☰</button>
                    </div>
                    <Button
                        size="sm" variant="outline"
                        onClick={() => setShowWorkload(v => !v)}
                        style={{ fontFamily: 'var(--mono)', fontSize: 11 }}
                    >
                        👥 Workload
                    </Button>
                    <Button size="sm" onClick={handleAddClick}>+ Add Project</Button>
                </div>
            </div>

            {/* Workload panel */}
            <WorkloadPanel open={showWorkload} />

            {/* Add Project Dialog */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="add-asset-modal-wide">
                    <DialogTitle className="sr-only">New Project</DialogTitle>
                    <div className="add-asset-split">

                        {/* Left branding panel */}
                        <div className="add-asset-branding">
                            <div className="add-asset-branding-inner">
                                <div className="auth-logo-box">IT</div>
                                <h2 className="auth-brand-title">New Project</h2>
                                <p className="auth-brand-sub">Create a project to track tasks, deadlines, and team progress.</p>
                                <ul className="auth-feature-list">
                                    <li>📋 Organize tasks by project</li>
                                    <li>👥 Assign team members</li>
                                    <li>📅 Set start &amp; end dates</li>
                                    <li>📊 Track completion progress</li>
                                </ul>
                                {/* Live member preview */}
                                {form.members.length > 0 && (
                                    <div style={{ marginTop: 16 }}>
                                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--mono)', marginBottom: 6 }}>
                                            {form.members.length} member{form.members.length !== 1 ? 's' : ''} selected
                                        </p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                            {form.members.map(uid => {
                                                const u = users.find(x => x._id === uid)
                                                return u ? (
                                                    <span key={uid} style={{ border: '2px solid rgba(255,255,255,0.4)', borderRadius: '50%' }}>
                                                        <Avatar user={u} size={26} />
                                                    </span>
                                                ) : null
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right form panel */}
                        <div className="add-asset-form-panel">
                            <div className="auth-form-header">
                                <h2>Project Details</h2>
                                <p className="auth-form-desc">Fill in the fields below to create the project</p>
                            </div>
                            <form onSubmit={handleSubmit} className="add-asset-form">
                                <div className="add-asset-form-grid">
                                    <div className="assets-field" style={{ gridColumn: '1 / -1' }}>
                                        <label>Name *</label>
                                        <Input
                                            value={form.name}
                                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                            required placeholder="Project name"
                                        />
                                    </div>
                                    <div className="assets-field" style={{ gridColumn: '1 / -1' }}>
                                        <label>Description</label>
                                        <Input
                                            value={form.description}
                                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                            placeholder="Optional description"
                                        />
                                    </div>
                                    <div className="assets-field">
                                        <label>Priority</label>
                                        <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="assets-field">
                                        {/* spacer */}
                                    </div>
                                    <div className="assets-field">
                                        <label>Start Date</label>
                                        <Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                                    </div>
                                    <div className="assets-field">
                                        <label>End Date</label>
                                        <Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                                    </div>
                                </div>

                                {users.length > 0 && (
                                    <div className="assets-field">
                                        <label>Members</label>
                                        <div className="proj-member-picker">
                                            {users.map(u => {
                                                const name = u.firstName ? `${u.firstName} ${u.lastName}` : u.email
                                                const selected = form.members.includes(u._id)
                                                return (
                                                    <button
                                                        key={u._id}
                                                        type="button"
                                                        className={`proj-member-chip${selected ? ' proj-member-chip-active' : ''}`}
                                                        onClick={() => toggleMember(u._id)}
                                                    >
                                                        <Avatar user={u} size={18} />
                                                        <span>{name}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="add-asset-modal-footer">
                                    <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                                    <Button type="submit" size="sm" disabled={saving}>{saving ? 'Saving...' : 'Save Project'}</Button>
                                </div>
                            </form>
                        </div>

                    </div>
                </DialogContent>
            </Dialog>

            <div className="assets-grid">
                {loading ? (
                    <div className="page-skeleton">{[...Array(6)].map((_, i) => <Skeleton key={i} />)}</div>
                ) : filtered.length === 0 ? (
                    <div className="table-empty">No projects found.</div>
                ) : viewMode === 'card' ? (
                    <div className="proj-card-grid">
                        {filtered.map(p => (
                            <ProjectCard
                                key={p._id}
                                project={p}
                                onStatusChange={handleStatusChange}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    /* List view */
                    <Table>
                        <TableHeader className="assets-sticky-header">
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Progress</TableHead>
                                <TableHead>Members</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map(p => {
                                const dueDate = p.endDate ? new Date(p.endDate) : null
                                return (
                                    <TableRow key={p._id} className={p.isOverdue ? 'proj-row-overdue' : ''}>
                                        <TableCell className="table-cell-title">
                                            {p.name}
                                            {p.isOverdue && <span style={{ marginLeft: 6 }}><OverdueBadge /></span>}
                                            {p.description && (
                                                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 400, marginTop: 1 }}>
                                                    {p.description}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell><StatusPill status={p.status} /></TableCell>
                                        <TableCell><Badge variant={PRIORITY_VARIANT[p.priority]}>{p.priority}</Badge></TableCell>
                                        <TableCell style={{ minWidth: 120 }}>
                                            <ProgressBar done={p.taskDone} total={p.taskTotal} />
                                        </TableCell>
                                        <TableCell>
                                            <div style={{ display: 'flex' }}>
                                                {(p.members ?? []).slice(0, 4).map((m, i) => (
                                                    <span key={m._id ?? i} style={{ marginLeft: i > 0 ? -5 : 0 }}>
                                                        <Avatar user={m} size={20} />
                                                    </span>
                                                ))}
                                                {(p.members ?? []).length > 4 && (
                                                    <span style={{
                                                        marginLeft: -5, width: 20, height: 20, borderRadius: '50%',
                                                        background: '#e0f2fe', color: '#0369a1', fontSize: 9,
                                                        fontFamily: 'var(--mono)', fontWeight: 700,
                                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                        border: '2px solid #fff',
                                                    }}>
                                                        +{p.members.length - 4}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell style={{ fontFamily: 'var(--mono)', fontSize: 12, color: p.isOverdue ? '#dc2626' : 'inherit' }}>
                                            {dueDate ? dueDate.toLocaleDateString() : '—'}
                                        </TableCell>
                                        <TableCell>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <Select value={p.status} onValueChange={v => handleStatusChange(p._id, v)}>
                                                    <SelectTrigger className="status-select" style={{ height: 26, fontSize: 11 }}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" size="sm">Delete</Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <p>Delete <strong>{p.name}</strong>? This cannot be undone.</p>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(p._id)}>Delete</AlertDialogAction>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                )}
            </div>

            <div className="dash-statusbar">
                <span>{filtered.length} project{filtered.length !== 1 ? 's' : ''}{hasFilters ? ' (filtered)' : ''}</span>
                <span>
                    {projects.filter(p => p.status === 'Active').length} active ·{' '}
                    {projects.filter(p => p.status === 'Completed').length} completed ·{' '}
                    {projects.filter(p => p.isOverdue).length} overdue
                </span>
            </div>
        </div>
    )
}
