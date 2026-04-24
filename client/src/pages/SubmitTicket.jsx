// http://localhost:5173/submit-ticket

import { useState } from 'react'

export default function SubmitTicket() {
    const [form, setForm] = useState({ title: '', description: '', priority: 'Low', guestName: '', guestEmail: '' })
    const [status, setStatus] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/v1/public/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })
            if (!res.ok) throw new Error('Failed to submit')
            setStatus('success')
        } catch {
            setStatus('error')
        }
    }

    if (status === 'success') return <p>Ticket submitted! We'll get back to you at {form.guestEmail}.</p>

    return (
        <div style={{ maxWidth: 480, margin: '60px auto', padding: 24 }}>
            <h2>Submit a Support Ticket</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input required placeholder="Your Name" value={form.guestName} onChange={e => setForm(f => ({ ...f, guestName: e.target.value }))} />
                <input required type="email" placeholder="Your Email" value={form.guestEmail} onChange={e => setForm(f => ({ ...f, guestEmail: e.target.value }))} />
                <input required placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                <textarea required placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                    {['Low', 'Medium', 'High', 'Critical'].map(p => <option key={p}>{p}</option>)}
                </select>
                <button type="submit">Submit Ticket</button>
            </form>
            {status === 'error' && <p style={{ color: 'red' }}>Submission failed. Try again.</p>}
        </div>
    )
}