// http://localhost:5173/submit-ticket

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const INITIAL = { title: '', description: '', priority: 'Low', guestName: '', guestEmail: '' }

export default function SubmitTicket() {
    const [form, setForm] = useState(INITIAL)
    const [status, setStatus] = useState(null)
    const [loading, setLoading] = useState(false)

    const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/v1/public/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })
            if (!res.ok) throw new Error()
            setStatus('success')
        } catch {
            setStatus('error')
        } finally {
            setLoading(false)
        }
    }

    if (status === 'success') return (
        <div className="auth-page">
            <div className="auth-form" style={{ textAlign: 'center', gap: 16 }}>
                <div style={{ fontSize: 40 }}>✅</div>
                <h2>Ticket Submitted</h2>
                <p className="auth-form-desc">We'll get back to you at <strong>{form.guestEmail}</strong>.</p>
                <Button variant="outline" onClick={() => { setForm(INITIAL); setStatus(null) }}>
                    Submit Another
                </Button>
                <Link to="/login"><p className="auth-switch">Staff? <span style={{ fontWeight: 500 }}>Sign in</span></p></Link>
            </div>
        </div>
    )

    return (
        <div className="auth-page">
            <div className="auth-panel">
                <div className="auth-branding">
                    <div className="auth-branding-inner">
                        <div className="auth-logo">🎫</div>
                        <h1 className="auth-brand-title">Submit a Ticket</h1>
                        <p className="auth-brand-sub">Describe your issue and our IT team will respond promptly.</p>
                    </div>
                </div>
                <div className="auth-form-panel">
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-form-header">
                            <h2>New Support Request</h2>
                            <p className="auth-form-desc">Fill in the details below</p>
                        </div>
                        {status === 'error' && <p className="error">Submission failed. Please try again.</p>}
                        <div className="auth-row">
                            <div className="auth-field">
                                <label>Name</label>
                                <Input required placeholder="Your name" value={form.guestName} onChange={set('guestName')} />
                            </div>
                            <div className="auth-field">
                                <label>Email</label>
                                <Input required type="email" placeholder="you@example.com" value={form.guestEmail} onChange={set('guestEmail')} />
                            </div>
                        </div>
                        <div className="auth-field">
                            <label>Title</label>
                            <Input required placeholder="Brief summary of the issue" value={form.title} onChange={set('title')} />
                        </div>
                        <div className="auth-field">
                            <label>Description</label>
                            <textarea
                                required
                                placeholder="Describe the issue in detail..."
                                value={form.description}
                                onChange={set('description')}
                                rows={4}
                                style={{ padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14, background: 'var(--bg)', color: 'var(--text-h)', resize: 'vertical' }}
                            />
                        </div>
                        <div className="auth-field">
                            <label>Priority</label>
                            <select value={form.priority} onChange={set('priority')}
                                style={{ padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14, background: 'var(--bg)', color: 'var(--text-h)' }}>
                                {['Low', 'Medium', 'High', 'Critical'].map(p => <option key={p}>{p}</option>)}
                            </select>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Ticket'}
                        </Button>
                        <p className="auth-switch">Staff? <Link to="/login">Sign in here</Link></p>
                    </form>
                </div>
            </div>
        </div>
    )
}