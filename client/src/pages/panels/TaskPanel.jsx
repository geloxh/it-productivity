import { useState, useCallback } from 'react'
import { api } from '../../api/index'
import { useData } from '../../hooks/useData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']

const PRIORITY_DOT = {
    Low: '#22c55e',
    Medium: '#f59e0b',
    High: '#ef4444',
    Critical: '#7c3aed',
}

const STATUS_STEPS = [
    { value: 'To-Do', label: 'To-Do', color: '#0369a1' },
    { value: 'In-Progress', label: 'In Progress',  color: '#1d4ed8' },
    { value: 'Review', label: 'Review', color: '#a16207' },
    { value: 'Done', label: 'Done', color: '#15803d' },
]

const EMPTY = {
    title: '', description: '', priority: 'Medium',
    project: '', assignedTo: '', dueDate: '',
    relatedTicket: '', relatedAsset: '',
}

function userName(u) {
    return u?.firstName ? `${u.firstName} ${u.lastName}` : u?.email ?? ''
}

export default function TaskPanel() {
    const projectFetcher = useCallback(() => api.get('/projects').then(d => d.projects ?? d), [])
    const usersFetcher = useCallback(() => api.get('/users'), [])
    const ticketFetcher = useCallback(() => api.get('/tickets').then(d => d.tickets ?? d), [])
    const assetFetcher = useCallback(() => api.get('/assets').then(d => d.assets ?? d), [])

    const { data: projects = [] } = useData(projectFetcher)
    const { data: users = [] } = useData(usersFetcher)
    const { data: tickets = [] } = useData(ticketFetcher)
    const { data: assets = [] } = useData(assetFetcher)

    const [form, setForm] = useState(EMPTY)
    const [saving, setSaving] = useState(false)

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
                relatedTicket: form.relatedTicket || undefined,
                relatedAsset: form.relatedAsset || undefined,
            }
            const res = await api.post('/tasks', payload)
            if (res.error) return toast.error(res.error)
            localStorage.setItem('panel:reload', 'tasks')
            window.close()
        } catch (err) {
            toast.error(err.message)
        } finally { setSaving(false) }
    }

    // Derive selected project name for left panel preview
    const selectedProject = projects.find(p => p._id === form.project)
    const selectedUser  = users.find(u => u._id === form.assignedTo)

    return (
        <div className="add-asset-split" style={{ minHeight: '100svh' }}>

            {/* Left branding panel */}
            <div className="add-asset-branding">
                <div className="add-asset-branding-inner">
                    <div className="auth-logo-box">IT</div>
                    <h2 className="auth-brand-title">New Task</h2>
                    <p className="auth-brand-sub">Create a task and track it through to completion.</p>

                    {/* Priority selector */}
                    <div style={{ marginTop: 12 }}>
                        <p className="priority-list-title">Priority</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {PRIORITIES.map(p => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, priority: p }))}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        padding: '5px 8px', borderRadius: 6, border: 'none',
                                        background: form.priority === p ? 'rgba(255,255,255,0.15)' : 'transparent',
                                        outline: form.priority === p ? '1px solid rgba(255,255,255,0.25)' : 'none',
                                        cursor: 'pointer', textAlign: 'left',
                                        transition: 'background 0.15s',
                                    }}
                                >
                                    <span style={{
                                        width: 8, height: 8, borderRadius: '50%',
                                        background: PRIORITY_DOT[p], flexShrink: 0,
                                        boxShadow: form.priority === p ? `0 0 0 3px rgba(255,255,255,0.2)` : 'none',
                                    }} />
                                    <span style={{ fontSize: 12, color: '#fff', fontFamily: 'var(--mono)', fontWeight: form.priority === p ? 600 : 400 }}>{p}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Live preview */}
                    {(selectedProject || selectedUser || form.dueDate) && (
                        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Summary</p>
                            {selectedProject && (
                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--mono)' }}>
                                    📋 {selectedProject.name}
                                </span>
                            )}
                            {selectedUser && (
                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--mono)' }}>
                                    👤 {userName(selectedUser)}
                                </span>
                            )}
                            {form.dueDate && (
                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--mono)' }}>
                                    📅 Due {new Date(form.dueDate).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    )}

                    <ul className="auth-feature-list" style={{ marginTop: 16 }}>
                        <li>✅ Track status end-to-end</li>
                        <li>👤 Assign to a team member</li>
                        <li>🎫 Link to a ticket or asset</li>
                        <li>📋 Nest subtasks inside</li>
                    </ul>
                </div>
            </div>

            {/* Right form panel */}
            <div className="add-asset-form-panel">
                <div className="auth-form-header">
                    <h2>Task Details</h2>
                    <p className="auth-form-desc">Fill in the fields below to create the task</p>
                </div>
                <form onSubmit={handleSubmit} className="add-asset-form">
                    <div className="add-asset-form-grid">

                        {/* Title — full width */}
                        <div className="assets-field" style={{ gridColumn: '1 / -1' }}>
                            <label>Title *</label>
                            <Input
                                value={form.title}
                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                required
                                placeholder="Task title"
                            />
                        </div>

                        {/* Description — full width */}
                        <div className="assets-field" style={{ gridColumn: '1 / -1' }}>
                            <label>Description</label>
                            <Input
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="Optional description"
                            />
                        </div>

                        {/* Project */}
                        <div className="assets-field">
                            <label>Project *</label>
                            <Select value={form.project} onValueChange={v => setForm(f => ({ ...f, project: v }))}>
                                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                                <SelectContent>
                                    {projects.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Priority */}
                        <div className="assets-field">
                            <label>Priority</label>
                            <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {PRIORITIES.map(p => (
                                        <SelectItem key={p} value={p}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: PRIORITY_DOT[p], flexShrink: 0 }} />
                                                {p}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Assign To */}
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
                                        <SelectItem key={u._id} value={u._id}>{userName(u)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Due Date */}
                        <div className="assets-field">
                            <label>Due Date</label>
                            <Input
                                type="date"
                                value={form.dueDate}
                                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                            />
                        </div>

                        {/* Linked Ticket */}
                        <div className="assets-field">
                            <label>Linked Ticket</label>
                            <Select
                                value={form.relatedTicket || 'none'}
                                onValueChange={v => setForm(f => ({ ...f, relatedTicket: v === 'none' ? '' : v }))}
                            >
                                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {tickets.map(t => (
                                        <SelectItem key={t._id} value={t._id}>
                                            🎫 {t.title?.slice(0, 36)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Linked Asset */}
                        <div className="assets-field">
                            <label>Linked Asset</label>
                            <Select
                                value={form.relatedAsset || 'none'}
                                onValueChange={v => setForm(f => ({ ...f, relatedAsset: v === 'none' ? '' : v }))}
                            >
                                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {assets.map(a => (
                                        <SelectItem key={a._id} value={a._id}>
                                            🖥 {a.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                    </div>

                    <div className="add-asset-modal-footer">
                        <Button type="button" size="sm" variant="outline" onClick={() => window.close()}>Cancel</Button>
                        <Button type="submit" size="sm" disabled={saving}>{saving ? 'Saving...' : 'Save Task'}</Button>
                    </div>
                </form>
            </div>

        </div>
    )
}
