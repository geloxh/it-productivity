import { useState, useCallback } from 'react'
import { api } from '../../api/index'
import { useData } from '../../hooks/useData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

const PRIORITIES = [
    { value: 'Low',      hint: 'Minor issue, no immediate impact on work.' },
    { value: 'Medium',   hint: 'Affects productivity but a workaround exists.' },
    { value: 'High',     hint: 'Significant impact, no workaround available.' },
    { value: 'Critical', hint: 'Complete work stoppage or security breach.' },
]
const CATEGORIES = ['Hardware', 'Software', 'Network', 'Access', 'Other']
const EMPTY = { title: '', description: '', priority: 'Low', category: 'Other', assignedTo: '' }

export default function TicketPanel() {
    const usersFetcher = useCallback(() => api.get('/users'), [])
    const { data: users = [] } = useData(usersFetcher)

    const [form, setForm] = useState(EMPTY)
    const [saving, setSaving] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true)
        try {
            await api.post('/tickets', {
                ...form,
                assignedTo: form.assignedTo === 'unassigned' ? undefined : form.assignedTo || undefined
            })
            localStorage.setItem('panel:reload', 'tickets')
            window.close()
        } catch (err) {
            toast.error(err.message)
        } finally { setSaving(false) }
    }

    return (
        <div className="add-ticket-split" style={{ minHeight: '100vh' }}>
            <div className="add-ticket-branding">
                <div className="add-ticket-branding-inner">
                    <div className="auth-logo-box">IT</div>
                    <h2 className="auth-brand-title">New Ticket</h2>
                    <p className="auth-brand-sub">Describe the issue and assign it to the right team member.</p>
                    <div className="priority-list-wrapper">
                        <h3 className="priority-list-title">Priority Level</h3>
                        <ul className="priority-list">
                            {PRIORITIES.map(p => (
                                <li key={p.value}
                                    className={`priority-list-item${form.priority === p.value ? ' priority-list-item--active' : ''}`}
                                    onClick={() => setForm(f => ({ ...f, priority: p.value }))}>
                                    <span className="priority-dot" data-priority={p.value} />
                                    <div>
                                        <span className="priority-list-value">{p.value}</span>
                                        <span className="priority-list-hint">{p.hint}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="add-ticket-form-panel">
                <div className="auth-form-header">
                    <h2>New Support Request</h2>
                    <p className="auth-form-desc">Fill in the details below</p>
                </div>
                <form onSubmit={handleSubmit} className="add-ticket-form">
                    <div className="auth-field">
                        <label>Title *</label>
                        <Input required placeholder="Brief summary of the issue"
                            value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} maxLength={200} />
                    </div>
                    <div className="auth-field">
                        <label>Description *</label>
                        <textarea required className="submit-textarea" placeholder="Describe the issue in detail..."
                            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            rows={4} maxLength={2000} />
                    </div>
                    <div className="auth-row">
                        <div className="auth-field">
                            <label>Category</label>
                            <select className="submit-select" value={form.category}
                                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="auth-field">
                            <label>Priority</label>
                            <select className="submit-select" value={form.priority}
                                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                                {PRIORITIES.map(p => <option key={p.value}>{p.value}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="auth-field">
                        <label>Assign To</label>
                        <select className="submit-select"
                            value={form.assignedTo || 'unassigned'}
                            onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value === 'unassigned' ? '' : e.target.value }))}>
                            <option value="unassigned">Unassigned</option>
                            {users.map(u => <option key={u._id} value={u._id}>{u.name ?? u.email}</option>)}
                        </select>
                    </div>
                    <div className="add-ticket-modal-footer">
                        <Button type="button" size="sm" variant="outline" onClick={() => window.close()}>Cancel</Button>
                        <Button type="submit" size="sm" disabled={saving}>{saving ? 'Saving...' : 'Create Ticket'}</Button>
                    </div>
                </form>
            </div>
        </div>
    )
}