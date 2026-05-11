import { useState, useCallback } from 'react'
import { api } from '../../api/index'
import { useData } from '../../hooks/useData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']

const EMPTY = {
    name: '', description: '', priority: 'Medium',
    startDate: '', endDate: '', members: []
}

function avatarColor(str = '') {
    const colors = ['#0284c7', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#ca8a04', '#0891b2']
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

export default function ProjectPanel() {
    const usersFetcher = useCallback(() => api.get('/users'), [])
    const { data: users = [] } = useData(usersFetcher)

    const [form, setForm] = useState(EMPTY)
    const [saving, setSaving] = useState(false)

    const toggleMember = (uid) => {
        setForm(f => ({
            ...f,
            members: f.members.includes(uid)
                ? f.members.filter(id => id !== uid)
                : [...f.members, uid]
        }))
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
            const res = await api.post('/projects', payload)
            if (res.error) return toast.error(res.error)
            localStorage.setItem('panel:reload', 'projects')
            window.close()
        } catch (err) {
            toast.error(err.message)
        } finally { setSaving(false) }
    }

    return (
        <div className="add-asset-split" style={{ minHeight: '100svh' }}>

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
                            <p style={{
                                fontSize: 11, color: 'rgba(255,255,255,0.6)',
                                fontFamily: 'var(--mono)', marginBottom: 6
                            }}>
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
                                <SelectContent>
                                    {PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="assets-field">
                            {/* spacer */}
                        </div>
                        <div className="assets-field">
                            <label>Start Date</label>
                            <Input
                                type="date"
                                value={form.startDate}
                                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                            />
                        </div>
                        <div className="assets-field">
                            <label>End Date</label>
                            <Input
                                type="date"
                                value={form.endDate}
                                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                            />
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
                        <Button type="button" size="sm" variant="outline" onClick={() => window.close()}>Cancel</Button>
                        <Button type="submit" size="sm" disabled={saving}>{saving ? 'Saving...' : 'Save Project'}</Button>
                    </div>
                </form>
            </div>

        </div>
    )
}
