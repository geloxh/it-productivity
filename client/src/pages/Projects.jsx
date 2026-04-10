import { useEffect, useState } from 'react'
import { api } from '../api/index'

export default function Projects() {
    const [projects, setProjects] = useStae([])
    const [form, setForm] = useState({ name: '', description: '', priority: 'Medium' })
    const [error, setError] = useState(null)

    const load = () => api.get('/projects').then(d => setProjects(d.projects ?? d)).catch(() => setError('Failed to load projects.'))

    useEffect(() => { load() }, [])

    const submit = async (e) => {
        e.preventDefault()
        await api.post('/projects', form)
        setForm({ name: '', description: '', priority: 'Medium' })
        load()
    }

    const remove = async (id) => { await api.delete(`/projects/${id}`);
        load()
    }

    if (error) return <p className="error">{error}</p>

    return (
        <div>
            <h2>Projects</h2>
            <form className="inline-form" onSubmit={submit}>
                <input placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required/>
                <input placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                    {[ 'Low', 'Medium', 'High', 'Critical' ].map(p => <option key={p}>{p}</option>)}
                </select>
                <button type="submit">Add Project</button>
            </form>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {projects.map(p => (
                        <tr key={p._id}>
                            <td>{p.name}</td>
                            <td>{p.status}</td>
                            <td>{p.priority}</td>
                            <td><button className="btn-danger" onClick={() => remove(p._id)}>Delete</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}