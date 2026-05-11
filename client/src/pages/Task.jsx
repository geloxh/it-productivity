import { useState, useCallback } from 'react'
import { api } from '../api/index'
import { useData } from '../hooks/useData'
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
const STATUSES = ['To-Do', 'In-Progress', 'Review', 'Done']

const PRIORITY_VARIANT = { Low: 'secondary', Medium: 'outline', High: 'default', Critical: 'destructive' }
const STATUS_COLOR = {
    'To-Do':       { bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd' },
    'In-Progress': { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
    'Review':      { bg: '#fefce8', color: '#a16207', border: '#fde68a' },
    'Done':        { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
}

const EMPTY = { title: '', description: '', priority: 'Medium', project: '', assignedTo: '', dueDate: '' }

function StatusPill({ status }) {
    const s = STATUS_COLOR[status] ?? STATUS_COLOR['To-Do']
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '2px 8px', borderRadius: 999, fontSize: 11,
            fontFamily: 'var(--mono)', fontWeight: 500, whiteSpace: 'nowrap',
            background: s.bg, color: s.color, border: `1px solid ${s.border}`,
        }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            {status}
        </span>
    )
}

export default function Tasks() {
    const taskFetcher    = useCallback(() => api.get('/tasks').then(d => d.tasks ?? d), [])
    const projectFetcher = useCallback(() => api.get('/projects').then(d => d.projects ?? d), [])
    const usersFetcher   = useCallback(() => api.get('/users'), [])

    const { data: tasks = [],    loading: loadingTasks, reload } = useData(taskFetcher)
    const { data: projects = [] } = useData(projectFetcher)
    const { data: users = [] }    = useData(usersFetcher)

    const [form, setForm]           = useState(EMPTY)
    const [showForm, setShowForm]   = useState(false)
    const [saving, setSaving]       = useState(false)
    const [search, setSearch]       = useState('')
    const [filterStatus, setFilterStatus]     = useState('all')
    const [filterPriority, setFilterPriority] = useState('all')

    const hasFilters = search || filterStatus !== 'all' || filterPriority !== 'all'

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.project) return toast.error('Please select a project.')
        setSaving(true)
        try {
            const payload = {
                title: form.title,
                description: form.description || undefined,
                project: form.project,
                priority: form.priority,
                assignedTo: form.assignedTo || undefined,
                dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
            }
            await api.post('/tasks', payload)
            toast.success('Task created.')
            setForm({ ...EMPTY, project: form.project })
            setShowForm(false)
            reload()
        } catch (err) { toast.error(err.message) }
        finally { setSaving(false) }
    }

    const handleDelete = async (id) => {
        try { await api.delete(`/tasks/${id}`); toast.success('Task deleted.'); reload() }
        catch (err) { toast.error(err.message) }
    }

    const handleStatusChange = async (id, status) => {
        try {
            const res = await api.put(`/tasks/${id}`, { status })
            if (res.error) return toast.error(res.error)
            reload()
        } catch (err) { toast.error(err.message) }
    }

    const filtered = tasks.filter(t => {
        const matchText = t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.project?.name?.toLowerCase().includes(search.toLowerCase()) ||
            t.assignedTo?.name?.toLowerCase().includes(search.toLowerCase())
        const matchStatus   = filterStatus === 'all'   || t.status === filterStatus
        const matchPriority = filterPriority === 'all' || t.priority === filterPriority
        return matchText && matchStatus && matchPriority
    })

    const counts = STATUSES.reduce((acc, s) => {
        acc[s] = tasks.filter(t => t.status === s).length
        return acc
    }, {})

    return (
        <div className="assets-root">
            <div className="dash-toolbar">
                <span className="dash-title">
                    Tasks
                    {tasks.length > 0 && (
                        <span className="dash-title-count">
                            ({counts['To-Do']} to-do · {counts['In-Progress']} in progress)
                        </span>
                    )}
                </span>
                <div className="dash-toolbar-right">
                    <Input
                        placeholder="Search tasks, project, assignee..."
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
                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                        <SelectTrigger className="filter-select"><SelectValue placeholder="Priority" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Priorities</SelectItem>
                            {PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    {hasFilters && (
                        <Button size="sm" variant="ghost" onClick={() => { setSearch(''); setFilterStatus('all'); setFilterPriority('all') }}>
                            ✕ Clear
                        </Button>
                    )}
                    <Button size="sm" onClick={() => setShowForm(true)}>+ Add Task</Button>
                </div>
            </div>

            {/* Add Task Dialog */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="dialog-md">
                    <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="dialog-form">
                        <div className="assets-field">
                            <label>Title *</label>
                            <Input
                                value={form.title}
                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                required
                                placeholder="Task title"
                            />
                        </div>
                        <div className="assets-field">
                            <label>Description</label>
                            <Input
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="Optional description"
                            />
                        </div>
                        <div className="task-form-row">
                            <div className="assets-field">
                                <label>Project *</label>
                                <Select value={form.project} onValueChange={v => setForm(f => ({ ...f, project: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                                    <SelectContent>
                                        {projects.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="assets-field">
                                <label>Priority</label>
                                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="task-form-row">
                            <div className="assets-field">
                                <label>Assign To</label>
                                <Select
                                    value={form.assignedTo || 'unassigned'}
                                    onValueChange={v => setForm(f => ({ ...f, assignedTo: v === 'unassigned' ? '' : v }))}
                                >
                                    <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                        {users.map(u => (
                                            <SelectItem key={u._id} value={u._id}>
                                                {u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.name ?? u.email}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="assets-field">
                                <label>Due Date</label>
                                <Input
                                    type="date"
                                    value={form.dueDate}
                                    onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="dialog-footer">
                            <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                            <Button type="submit" size="sm" disabled={saving}>{saving ? 'Saving...' : 'Save Task'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="assets-grid">
                {loadingTasks ? (
                    <div className="page-skeleton">{[...Array(6)].map((_, i) => <Skeleton key={i} />)}</div>
                ) : (
                    <Table>
                        <TableHeader className="assets-sticky-header">
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Project</TableHead>
                                <TableHead>Assigned To</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="table-empty">No tasks found.</TableCell>
                                </TableRow>
                            )}
                            {filtered.map(t => {
                                const isOverdue = t.dueDate && t.status !== 'Done' && new Date(t.dueDate) < new Date()
                                return (
                                    <TableRow key={t._id} className={t.status === 'Done' ? 'task-row-done' : ''}>
                                        <TableCell className="table-cell-title">
                                            {t.title}
                                            {isOverdue && <span className="task-overdue-tag">overdue</span>}
                                        </TableCell>
                                        <TableCell>{t.project?.name ?? '—'}</TableCell>
                                        <TableCell>
                                            {t.assignedTo
                                                ? (t.assignedTo.firstName
                                                    ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}`
                                                    : t.assignedTo.name ?? t.assignedTo.email)
                                                : <span style={{ color: 'var(--muted-foreground)' }}>—</span>
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={PRIORITY_VARIANT[t.priority]}>{t.priority}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Select value={t.status} onValueChange={v => handleStatusChange(t._id, v)}>
                                                <SelectTrigger className="task-status-trigger" style={{ border: 'none', background: 'transparent', padding: 0, height: 'auto', width: 'auto', gap: 4 }}>
                                                    <StatusPill status={t.status} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {STATUSES.map(s => (
                                                        <SelectItem key={s} value={s}>
                                                            <StatusPill status={s} />
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            {t.dueDate
                                                ? <span style={{ color: isOverdue ? '#dc2626' : 'inherit', fontFamily: 'var(--mono)', fontSize: 12 }}>
                                                    {new Date(t.dueDate).toLocaleDateString()}
                                                  </span>
                                                : <span style={{ color: 'var(--muted-foreground)' }}>—</span>
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm">Delete</Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <p>Delete <strong>{t.title}</strong>? This cannot be undone.</p>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(t._id)}>Delete</AlertDialogAction>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                )}
            </div>

            <div className="dash-statusbar">
                <span>
                    {filtered.length} task{filtered.length !== 1 ? 's' : ''}
                    {hasFilters ? ' (filtered)' : ''}
                </span>
                <span>
                    {counts['Done']} done · {counts['In-Progress']} in progress · {counts['To-Do']} to-do
                </span>
            </div>
        </div>
    )
}