import { useState, useCallback, useRef, useEffect } from 'react'
import { api } from '../api/index'
import { useData } from '../hooks/useData'
import { useAuth } from '../context/AuthContext'
import { useElectron } from '../context/ElectronContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']
const STATUSES   = ['To-Do', 'In-Progress', 'Review', 'Done']
const PRIORITY_VARIANT = { Low: 'secondary', Medium: 'outline', High: 'default', Critical: 'destructive' }
const STATUS_COLOR = {
    'To-Do':       { bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd' },
    'In-Progress': { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
    'Review':      { bg: '#fefce8', color: '#a16207', border: '#fde68a' },
    'Done':        { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
}
const EMPTY = { title: '', description: '', priority: 'Medium', project: '', assignedTo: '', dueDate: '', relatedTicket: '', relatedAsset: '' }

function isToday(d) {
    const t = new Date(); return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate()
}
function isThisWeek(d) {
    const now = new Date(), end = new Date(now); end.setDate(now.getDate() + 7)
    return d > now && d <= end
}
function groupByDue(tasks) {
    const now = new Date()
    const overdue = [], today = [], thisWeek = [], later = [], noDue = []
    for (const t of tasks) {
        if (t.status === 'Done') continue
        if (!t.dueDate) { noDue.push(t); continue }
        const d = new Date(t.dueDate)
        if (d < now && !isToday(d)) overdue.push(t)
        else if (isToday(d)) today.push(t)
        else if (isThisWeek(d)) thisWeek.push(t)
        else later.push(t)
    }
    const done = tasks.filter(t => t.status === 'Done')
    return { overdue, today, thisWeek, later, noDue, done }
}

function userName(u) {
    if (!u) return null
    return u.firstName ? `${u.firstName} ${u.lastName}` : u.name ?? u.email
}

function StatusPill({ status }) {
    const s = STATUS_COLOR[status] ?? STATUS_COLOR['To-Do']
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 999, fontSize: 11, fontFamily: 'var(--mono)', fontWeight: 500, whiteSpace: 'nowrap', background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            {status}
        </span>
    )
}

function SubtaskList({ task, onUpdate }) {
    const [newTitle, setNewTitle] = useState('')
    const inputRef = useRef(null)

    const toggleSubtask = async (sub) => {
        const updated = task.subtasks.map(s =>
            s._id === sub._id ? { ...s, done: !s.done } : s
        )
        await onUpdate(task._id, { subtasks: updated })
    }

    const addSubtask = async (e) => {
        if (e.key !== 'Enter' || !newTitle.trim()) return
        e.preventDefault()
        const updated = [...(task.subtasks ?? []), { title: newTitle.trim(), done: false }]
        await onUpdate(task._id, { subtasks: updated })
        setNewTitle('')
    }

    const doneCount = (task.subtasks ?? []).filter(s => s.done).length
    const total = (task.subtasks ?? []).length

    return (
        <div className="subtask-list">
            {total > 0 && (
                <div className="subtask-progress">
                    <div style={{ flex: 1, height: 3, background: '#e0f2fe', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.round((doneCount / total) * 100)}%`, height: '100%', background: '#0284c7', borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: '#7ab8d4' }}>{doneCount}/{total}</span>
                </div>
            )}
            {(task.subtasks ?? []).map(sub => (
                <div key={sub._id} className="subtask-row">
                    <input
                        type="checkbox"
                        checked={sub.done}
                        onChange={() => toggleSubtask(sub)}
                        className="subtask-check"
                    />
                    <span style={{ fontSize: 12, color: sub.done ? '#7ab8d4' : '#0c4a6e', textDecoration: sub.done ? 'line-through' : 'none', fontFamily: 'var(--mono)' }}>
                        {sub.title}
                    </span>
                </div>
            ))}
            <input
                ref={inputRef}
                className="subtask-inline-input"
                placeholder="+ Add subtask (Enter to save)"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={addSubtask}
            />
        </div>
    )
}

function TaskRow({ task, onStatusChange, onUpdate, onDelete, projects, users, tickets, assets }) {
    const [expanded, setExpanded] = useState(false)
    const [editing, setEditing] = useState(false)
    const [editForm, setEditForm] = useState(null)
    const [saving, setSaving] = useState(false)
    const isOverdue = task.dueDate && task.status !== 'Done' && new Date(task.dueDate) < new Date()
    const subtaskTotal = (task.subtasks ?? []).length
    const subtaskDone  = (task.subtasks ?? []).filter(s => s.done).length

    const openEdit = () => {
        setEditForm({
            title: task.title,
            description: task.description ?? '',
            priority: task.priority,
            status: task.status,
            assignedTo: task.assignedTo?._id ?? '',
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
            project: task.project?._id ?? '',
            relatedTicket: task.relatedTicket?._id ?? '',
            relatedAsset: task.relatedAsset?._id ?? '',
        })
        setEditing(true)
    }

    const saveEdit = async (e) => {
        e.preventDefault(); setSaving(true)
        try {
            const payload = {
                title: editForm.title,
                description: editForm.description || undefined,
                priority: editForm.priority,
                status: editForm.status,
                assignedTo: editForm.assignedTo || undefined,
                dueDate: editForm.dueDate ? new Date(editForm.dueDate).toISOString() : undefined,
                relatedTicket: editForm.relatedTicket || undefined,
                relatedAsset: editForm.relatedAsset || undefined,
            }
            await onUpdate(task._id, payload)
            setEditing(false)
        } catch (err) { toast.error(err.message) }
        finally { setSaving(false) }
    }

    return (
        <>
            <div className={`task-list-row${task.status === 'Done' ? ' task-row-done' : ''}${isOverdue ? ' task-row-overdue-bg' : ''}`}>
                <input
                    type="checkbox"
                    className="subtask-check"
                    checked={task.status === 'Done'}
                    onChange={() => onStatusChange(task._id, task.status === 'Done' ? 'To-Do' : 'Done')}
                    title={task.status === 'Done' ? 'Mark incomplete' : 'Mark done'}
                />
                <button className="task-expand-btn" onClick={() => setExpanded(e => !e)} title="Subtasks">
                    {subtaskTotal > 0
                        ? <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: subtaskDone === subtaskTotal ? '#16a34a' : '#0369a1' }}>
                            {subtaskDone}/{subtaskTotal}
                          </span>
                        : <span style={{ fontSize: 11, color: '#bae6fd' }}>▸</span>
                    }
                </button>
                <span className="task-list-title" onClick={openEdit} title="Edit task">
                    {task.title}
                    {isOverdue && <span className="task-overdue-tag">overdue</span>}
                    {task.relatedTicket && <span className="task-link-tag">🎫 {task.relatedTicket.title?.slice(0, 20)}</span>}
                    {task.relatedAsset  && <span className="task-link-tag">🖥 {task.relatedAsset.name?.slice(0, 20)}</span>}
                </span>
                <span className="task-list-meta">{task.project?.name ?? '—'}</span>
                <span className="task-list-meta">{userName(task.assignedTo) ?? <span style={{ color: 'var(--muted-foreground)' }}>—</span>}</span>
                <Badge variant={PRIORITY_VARIANT[task.priority]} style={{ fontSize: 10 }}>{task.priority}</Badge>
                <Select value={task.status} onValueChange={v => onStatusChange(task._id, v)}>
                    <SelectTrigger className="task-status-trigger" style={{ border: 'none', background: 'transparent', padding: 0, height: 'auto', width: 'auto', gap: 4 }}>
                        <StatusPill status={task.status} />
                    </SelectTrigger>
                    <SelectContent>
                        {STATUSES.map(s => <SelectItem key={s} value={s}><StatusPill status={s} /></SelectItem>)}
                    </SelectContent>
                </Select>
                <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: isOverdue ? '#dc2626' : '#7ab8d4', flexShrink: 0 }}>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                </span>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <button className="task-delete-btn" title="Delete">✕</button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <p>Delete <strong>{task.title}</strong>? This cannot be undone.</p>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(task._id)}>Delete</AlertDialogAction>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            {expanded && (
                <div className="task-subtask-panel">
                    <SubtaskList task={task} onUpdate={onUpdate} />
                </div>
            )}

            <Dialog open={editing} onOpenChange={setEditing}>
                <DialogContent className="dialog-md">
                    <DialogHeader><DialogTitle>Edit Task</DialogTitle></DialogHeader>
                    {editForm && (
                        <form onSubmit={saveEdit} className="dialog-form">
                            <div className="assets-field">
                                <label>Title *</label>
                                <Input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} required />
                            </div>
                            <div className="assets-field">
                                <label>Description</label>
                                <Input value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
                            </div>
                            <div className="task-form-row">
                                <div className="assets-field">
                                    <label>Status</label>
                                    <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="assets-field">
                                    <label>Priority</label>
                                    <Select value={editForm.priority} onValueChange={v => setEditForm(f => ({ ...f, priority: v }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="task-form-row">
                                <div className="assets-field">
                                    <label>Assign To</label>
                                    <Select value={editForm.assignedTo || 'unassigned'} onValueChange={v => setEditForm(f => ({ ...f, assignedTo: v === 'unassigned' ? '' : v }))}>
                                        <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unassigned">Unassigned</SelectItem>
                                            {users.map(u => <SelectItem key={u._id} value={u._id}>{userName(u)}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="assets-field">
                                    <label>Due Date</label>
                                    <Input type="date" value={editForm.dueDate} onChange={e => setEditForm(f => ({ ...f, dueDate: e.target.value }))} />
                                </div>
                            </div>
                            <div className="task-form-row">
                                <div className="assets-field">
                                    <label>Linked Ticket</label>
                                    <Select value={editForm.relatedTicket || 'none'} onValueChange={v => setEditForm(f => ({ ...f, relatedTicket: v === 'none' ? '' : v }))}>
                                        <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {tickets.map(t => <SelectItem key={t._id} value={t._id}>🎫 {t.title?.slice(0, 40)}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="assets-field">
                                    <label>Linked Asset</label>
                                    <Select value={editForm.relatedAsset || 'none'} onValueChange={v => setEditForm(f => ({ ...f, relatedAsset: v === 'none' ? '' : v }))}>
                                        <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {assets.map(a => <SelectItem key={a._id} value={a._id}>🖥 {a.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="dialog-footer">
                                <Button type="button" size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                                <Button type="submit" size="sm" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}

function TaskGroup({ label, tasks, color, onStatusChange, onUpdate, onDelete, onInlineAdd, projects, users, tickets, assets, defaultProject }) {
    const [inlineTitle, setInlineTitle] = useState('')
    const inputRef = useRef(null)

    const handleInlineKey = async (e) => {
        if (e.key !== 'Enter' || !inlineTitle.trim()) return
        e.preventDefault()
        await onInlineAdd(inlineTitle.trim(), defaultProject)
        setInlineTitle('')
    }

    if (tasks.length === 0 && label !== 'Today' && label !== 'Overdue') return null

    return (
        <div className="task-group">
            <div className="task-group-header">
                <span className="task-group-label" style={{ color }}>{label}</span>
                <span className="task-group-count">{tasks.length}</span>
            </div>
            {tasks.map(t => (
                <TaskRow
                    key={t._id}
                    task={t}
                    onStatusChange={onStatusChange}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    projects={projects}
                    users={users}
                    tickets={tickets}
                    assets={assets}
                />
            ))}
            <div className="task-inline-add-row">
                <span style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid #bae6fd', flexShrink: 0 }} />
                <input
                    ref={inputRef}
                    className="task-inline-input"
                    placeholder="Add a task… (Enter to save)"
                    value={inlineTitle}
                    onChange={e => setInlineTitle(e.target.value)}
                    onKeyDown={handleInlineKey}
                />
            </div>
        </div>
    )
}

export default function Tasks() {
    const { user } = useAuth()
    const { openPanel, isElectron } = useElectron()

    const [viewMode, setViewMode] = useState('mine')
    const [search, setSearch]     = useState('')
    const [filterStatus, setFilterStatus]     = useState('all')
    const [filterPriority, setFilterPriority] = useState('all')
    const [showForm, setShowForm] = useState(false)
    const [form, setForm]         = useState(EMPTY)
    const [saving, setSaving]     = useState(false)

    const taskFetcher    = useCallback(() => viewMode === 'mine' ? api.get('/tasks/mine') : api.get('/tasks'), [viewMode])
    const projectFetcher = useCallback(() => api.get('/projects').then(d => d.projects ?? d), [])
    const usersFetcher   = useCallback(() => api.get('/users'), [])
    const ticketFetcher  = useCallback(() => api.get('/tickets').then(d => d.tickets ?? d), [])
    const assetFetcher   = useCallback(() => api.get('/assets').then(d => d.assets ?? d), [])

    const { data: tasks = [], loading, reload } = useData(taskFetcher)
    const { data: projects = [] } = useData(projectFetcher)
    const { data: users = [] }    = useData(usersFetcher)
    const { data: tickets = [] }  = useData(ticketFetcher)
    const { data: assets = [] }   = useData(assetFetcher)

    useEffect(() => {
        const handler = () => {
            if (localStorage.getItem('panel:reload') === 'tasks') {
                localStorage.removeItem('panel:reload')
                reload()
            }
        }
        window.addEventListener('storage', handler)
        return () => window.removeEventListener('storage', handler)
    }, [reload])

    const handleAddClick = () => {
        if (isElectron && openPanel) {
            openPanel({ route: '/panel/tasks/new', width: 960, height: 700, title: 'New Task' })
        } else {
            setShowForm(true)
        }
    }

    const hasFilters = search || filterStatus !== 'all' || filterPriority !== 'all'
    const defaultProject = projects[0]?._id ?? ''

    const filtered = tasks.filter(t => {
        const matchText = t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.project?.name?.toLowerCase().includes(search.toLowerCase())
        const matchStatus   = filterStatus === 'all'   || t.status === filterStatus
        const matchPriority = filterPriority === 'all' || t.priority === filterPriority
        return matchText && matchStatus && matchPriority
    })

    const groups = groupByDue(filtered)
    const counts = STATUSES.reduce((acc, s) => { acc[s] = tasks.filter(t => t.status === s).length; return acc }, {})

    const handleStatusChange = async (id, status) => {
        try { await api.put(`/tasks/${id}`, { status }); reload() }
        catch (err) { toast.error(err.message) }
    }

    const handleUpdate = async (id, patch) => {
        try { await api.put(`/tasks/${id}`, patch); reload() }
        catch (err) { toast.error(err.message); throw err }
    }

    const handleDelete = async (id) => {
        try { await api.delete(`/tasks/${id}`); toast.success('Task deleted.'); reload() }
        catch (err) { toast.error(err.message) }
    }

    const handleInlineAdd = async (title, project) => {
        if (!project) return toast.error('No project available. Create a project first.')
        try {
            await api.post('/tasks', {
                title,
                project,
                priority: 'Medium',
                assignedTo: viewMode === 'mine' ? user?._id : undefined,
            })
            reload()
        } catch (err) { toast.error(err.message) }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.project) return toast.error('Please select a project.')
        setSaving(true)
        try {
            await api.post('/tasks', {
                title: form.title,
                description: form.description || undefined,
                project: form.project,
                priority: form.priority,
                assignedTo: form.assignedTo || undefined,
                dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
                relatedTicket: form.relatedTicket || undefined,
                relatedAsset: form.relatedAsset || undefined,
            })
            toast.success('Task created.')
            setForm({ ...EMPTY, project: form.project })
            setShowForm(false)
            reload()
        } catch (err) { toast.error(err.message) }
        finally { setSaving(false) }
    }

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
                    <div className="assets-view-toggle">
                        <button className={`view-btn${viewMode === 'mine' ? ' active' : ''}`} onClick={() => setViewMode('mine')} title="My tasks">👤</button>
                        <button className={`view-btn${viewMode === 'all'  ? ' active' : ''}`} onClick={() => setViewMode('all')}  title="All tasks">☰</button>
                    </div>
                    <Input placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} className="assets-search" />
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
                        <Button size="sm" variant="ghost" onClick={() => { setSearch(''); setFilterStatus('all'); setFilterPriority('all') }}>✕ Clear</Button>
                    )}
                    <Button size="sm" onClick={handleAddClick}>+ Add Task</Button>
                </div>
            </div>

            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="dialog-md">
                    <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="dialog-form">
                        <div className="assets-field">
                            <label>Title *</label>
                            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="Task title" />
                        </div>
                        <div className="assets-field">
                            <label>Description</label>
                            <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
                        </div>
                        <div className="task-form-row">
                            <div className="assets-field">
                                <label>Project *</label>
                                <Select value={form.project} onValueChange={v => setForm(f => ({ ...f, project: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                                    <SelectContent>{projects.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="assets-field">
                                <label>Priority</label>
                                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="task-form-row">
                            <div className="assets-field">
                                <label>Assign To</label>
                                <Select value={form.assignedTo || 'unassigned'} onValueChange={v => setForm(f => ({ ...f, assignedTo: v === 'unassigned' ? '' : v }))}>
                                    <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                        {users.map(u => <SelectItem key={u._id} value={u._id}>{userName(u)}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="assets-field">
                                <label>Due Date</label>
                                <Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
                            </div>
                        </div>
                        <div className="task-form-row">
                            <div className="assets-field">
                                <label>Linked Ticket</label>
                                <Select value={form.relatedTicket || 'none'} onValueChange={v => setForm(f => ({ ...f, relatedTicket: v === 'none' ? '' : v }))}>
                                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {tickets.map(t => <SelectItem key={t._id} value={t._id}>🎫 {t.title?.slice(0, 40)}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="assets-field">
                                <label>Linked Asset</label>
                                <Select value={form.relatedAsset || 'none'} onValueChange={v => setForm(f => ({ ...f, relatedAsset: v === 'none' ? '' : v }))}>
                                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {assets.map(a => <SelectItem key={a._id} value={a._id}>🖥 {a.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="dialog-footer">
                            <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                            <Button type="submit" size="sm" disabled={saving}>{saving ? 'Saving...' : 'Save Task'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="assets-grid" style={{ padding: '8px 0' }}>
                {loading ? (
                    <div className="page-skeleton">{[...Array(6)].map((_, i) => <Skeleton key={i} />)}</div>
                ) : filtered.length === 0 ? (
                    <div className="table-empty">
                        {viewMode === 'mine' ? 'No tasks assigned to you.' : 'No tasks found.'}
                    </div>
                ) : (
                    <>
                        <div className="task-list-header">
                            <span style={{ width: 14 }} />
                            <span style={{ width: 20 }} />
                            <span style={{ flex: 1 }}>Title</span>
                            <span style={{ width: 110 }}>Project</span>
                            <span style={{ width: 110 }}>Assignee</span>
                            <span style={{ width: 70 }}>Priority</span>
                            <span style={{ width: 110 }}>Status</span>
                            <span style={{ width: 80 }}>Due</span>
                            <span style={{ width: 20 }} />
                        </div>

                        <TaskGroup label="Overdue"     tasks={groups.overdue}  color="#dc2626" onStatusChange={handleStatusChange} onUpdate={handleUpdate} onDelete={handleDelete} onInlineAdd={handleInlineAdd} projects={projects} users={users} tickets={tickets} assets={assets} defaultProject={defaultProject} />
                        <TaskGroup label="Today"       tasks={groups.today}    color="#ea580c" onStatusChange={handleStatusChange} onUpdate={handleUpdate} onDelete={handleDelete} onInlineAdd={handleInlineAdd} projects={projects} users={users} tickets={tickets} assets={assets} defaultProject={defaultProject} />
                        <TaskGroup label="This Week"   tasks={groups.thisWeek} color="#0284c7" onStatusChange={handleStatusChange} onUpdate={handleUpdate} onDelete={handleDelete} onInlineAdd={handleInlineAdd} projects={projects} users={users} tickets={tickets} assets={assets} defaultProject={defaultProject} />
                        <TaskGroup label="Later"       tasks={groups.later}    color="#7ab8d4" onStatusChange={handleStatusChange} onUpdate={handleUpdate} onDelete={handleDelete} onInlineAdd={handleInlineAdd} projects={projects} users={users} tickets={tickets} assets={assets} defaultProject={defaultProject} />
                        <TaskGroup label="No Due Date" tasks={groups.noDue}    color="#7ab8d4" onStatusChange={handleStatusChange} onUpdate={handleUpdate} onDelete={handleDelete} onInlineAdd={handleInlineAdd} projects={projects} users={users} tickets={tickets} assets={assets} defaultProject={defaultProject} />
                        {groups.done.length > 0 && (
                            <TaskGroup label={`Done (${groups.done.length})`} tasks={groups.done} color="#16a34a" onStatusChange={handleStatusChange} onUpdate={handleUpdate} onDelete={handleDelete} onInlineAdd={handleInlineAdd} projects={projects} users={users} tickets={tickets} assets={assets} defaultProject={defaultProject} />
                        )}
                    </>
                )}
            </div>

            <div className="dash-statusbar">
                <span>{filtered.length} task{filtered.length !== 1 ? 's' : ''}{hasFilters ? ' (filtered)' : ''} · {viewMode === 'mine' ? 'My Tasks' : 'All Tasks'}</span>
                <span>{counts['Done']} done · {counts['In-Progress']} in progress · {counts['To-Do']} to-do</span>
            </div>
        </div>
    )
}
