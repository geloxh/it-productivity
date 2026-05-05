// http://localhost:5173/submit-ticket

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const INITIAL = { title: '', description: '', priority: 'Low', guestName: '', guestEmail: '' }

const PRIORITIES = [ 'Low', 'Medium', 'High', 'Critical' ]

export default function SubmitTicket() {
    const [form, setForm] = useState(INITIAL)
    const [status, setStatus] = useState(null)
    const [errorMsg, setErrorMsg] = useState('')
    const [loading, setLoading] = useState(false)

    const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true);
        setErrorMsg('')
        try {
            const res = await fetch('/api/v1/public/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error ?? 'Submission failed.')
            setStatus('success')
        } catch (err) {
            setErrorMsg('err.message')
        } finally {
            setLoading(false)
        }
    }

    if (status === 'success') return (
        <div className="auth-page">
            <div className="submit-success">
                <div className="submit-success-icon">✅</div>
                <h2>Ticket Submitted</h2>
                <p className="auth-form-desc">
                    We'll get back to you at <strong>{form.guestEmail}</strong>.
                </p>
                <p className="auth-form-desc">
                    Keep an eye on your inbox - our IT Team typically responds within 1 business day.
                </p>
                <Button variant="outline" onClick={() => { setForm(INITIAL); setStatus(null) }}>
                    Submit Another Ticket
                </Button>
                <Link to="/login">
                    <p className="auth-switch">Staff? <span className="auth-switch-bold">Sign in</span></p>
                </Link>
            </div>
        </div>
    )

    return (
        <div className="auth-page">
            <div className="auth-panel">
                <div className="auth-branding">
                    <div className="auth-branding-inner">
                        <div className="auth-logo-box">IT</div>
                        <h1 className="auth-brand-title">Submit a Ticket</h1>
                        <p className="auth-brand-sub">Describe your issue and our IT team will respond promptly.</p>
                        <ul className="auth-feature-list">
                            <li>⚡ Fast response times</li>
                            <li>🔒 Secure submission</li>
                            <li>📧 Email confirmation</li>
                        </ul>
                    </div>
                </div>
                <div className="auth-form-panel">
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-form-header">
                            <h2>New Support Request</h2>
                            <p className="auth-form-desc">Fill in the details below</p>
                        </div>
                        {errorMsg && <p className="error">{errorMsg}</p>}
                        <div className="auth-row">
                            <div className="auth-field">
                                <label>Name *</label>
                                <Input 
                                    required 
                                    placeholder="Your name" 
                                    value={form.guestName} 
                                    onChange={set('guestName')}
                                    maxLength={100} 
                                />
                            </div>
                            <div className="auth-field">
                                <label>Email *</label>
                                <Input 
                                    required 
                                    type="email" 
                                    placeholder="you@example.com" 
                                    value={form.guestEmail} 
                                    onChange={set('guestEmail')}
                                    maxLength={200}
                                />
                            </div>
                        </div>
                        <div className="auth-field">
                            <label>Title *</label>
                            <Input 
                                required 
                                placeholder="Brief summary of the issue" 
                                value={form.title} 
                                onChange={set('title')}
                                maxLength={200} 
                            />
                        </div>
                        <div className="auth-field">
                            <label>Description *</label>
                            <textarea
                                required
                                className="submit-textarea"
                                placeholder="Describe the issue in detail..."
                                value={form.description}
                                onChange={set('description')}
                                rows={4}
                                maxLength={2000}
                            />
                            {form.description.length > 1600 && (
                                <span className="submit-char-count">
                                    {form.description.length}/2000
                                </span>
                            )}
                        </div>
                        <div className="auth-field">
                            <label>Priority</label>
                            <select 
                                className="submit-select"
                                value={form.priority} 
                                onChange={set('priority')}
                            >
                                {PRIORITIES.map(p => <option key={p}>{p}</option> )}
                            </select>
                        </div>
                        <Button type="submit" className="auth-submit-btn w-full" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Ticket'}
                        </Button>
                        <p className="auth-switch">Staff? <Link to="/login">Sign in here</Link></p>
                    </form>
                </div>
            </div>
        </div>
    )
}