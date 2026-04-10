import { useEffect, useState } from 'react'
import { api } from '../api/index'

const PRIORITY_COLOR = { Low: '#38a169', Medium: '#d69e2e', High: '#dd6b20', Critical: '#e53e3e' }
const STATUS_COLOR = { Open: '#3182ce', 'In-Progress': '#805ad5', Resolved: '#38a169', Closed: '#718096' }

export default function Tickets() {
    const [tickets, setTickets] = useState([])
    const [error, setError] = useState(null)
    const [form, setForm] = useState({ title: '', description: '', priority: 'Low' })
    const [loading, setLoading] = useState(true)

    const load = () => api.get('/tickets').then(d => { setTickets(d.tickets ?? d); setLoading(false) }).catch(() => setError('Failed to load tickets.'))

    useEffect(() => { load() }, [])

    const submit = async (e) => {
        e.preventDefault()
        await api.post('/tickets'. form)
        setForm({ title: '', description: '', priority: 'Low' })
        load()
    }

    const remove = async (id) => { await api.delete(`/tickets/${id}`); load() }

    if (loading) return <p>Loading...</p>
    if (error) return <p className="error">{error}</p>

    return (
        <div>
            <h2>Tickets</h2>
            <form className="inline-form" onSubmit={submit}>
                <input placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required/>
                <input placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required/>
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>{['Low', 'Medium', 'High', 'Critical'].map(p => <option key={p}>{p}</option>)}</select>
                <button type="submit">Add Ticket</button>
            </form>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tickets.map(t => (
                        <tr key={t.id}>
                            <td>{t.title}</td>
                            <td><span className="badge" style={{ background: PRIORITY_COLOR[t.priority] }}>{t.priority}</span></td>
                            <td><span className="badge" style={{ background: STATUS_COLOR[t.status] }}>{t.status}</span></td>
                            <td><button className="btn-danger" onClick={() => remove(t._id)}>Delete</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}