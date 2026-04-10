import { useEffect, useState } from 'react'
import { api } from '../api/index'

export default function Tasks() {
    const [tasks, setTasks] = useState([])
    const [projects, setProjects] = useState([])
    const [form, setForm] = useState({ title: '', priority: 'Medium', project: '' })
    const [error, setError] = useState(null)

    const load = () => Promise.all([
        api.get('/tasks').then(d => setTasks(d.tasks ?? d)),
        api.get('/projects').then(d => setProjects(d.projects ?? d))
    ]).catch(() => setError('Failed to load tasks.'))

    useEffect(() => { load() }, [])

    const submit = async (e) => {
        e.preventDefault()
        await api.post('/tasks', form)
        setForm({ title: '', priority: 'Medium', project: form.project })
        load()
    }

    const remove = async (id) => { await api.delete(`/tasks/${id}`); load() }

    if (error) return <p className="error">{error}</p>

    return (
        <div>
            <h2>Tasks</h2>
            <form className="inline-form" onSubmit={submit}>
                <input placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required/>
                <select value={form.project} onChange={e => setForm(f => ({ ...f, project: e.target.value }))} required>
                    <option value="">Select Project</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                    {[ 'Low', 'Medium', 'High', 'Critical' ].map(p => <option key={p}>{p}</option>)}
                </select>
                <button type="submit">Add Task</button>
            </form>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Project</th>
                        <th>Priority</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map(t => (
                        <tr key={t._id}>
                            <td>{t.title}</td>
                            <td>{t.project?.name ?? t.project}</td>
                            <td>{t.priority}</td>
                            <td><button className="btn-danger" onClick={() => remove(t._id)}>Delete</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}