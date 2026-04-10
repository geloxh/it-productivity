import { useEffect, useState } from 'react'
import { api } from '../api/index'

const CATEGORIES = [ 'Hardware', 'Software', 'Network', 'Security', 'General' ]

export default function KnowledgeBase() {
    const [articles, setArticles] = useState([])
    const [form, setForm] = useState({ title: '', content: '', category: 'General' })
    const [error, setError] = useState(null)

    const load = () => api.get('/knowledge-base').then(d => setArticles(d.articles ?? d)).catch(() => setError('Failed to load articles.'))

    useEffect(() => { load() }, [])

    const submit = async (e) => {
        e.preventDefault()
        await api.post('/knowledge-base', form)
        setForm({ title: '', content: '', category: 'General' })
        load()
    }

    const remove = async (id) => { await api.delete(`/knowledge-base/${id}`);
        load()
    }

    if (error) return <p className="error">{error}</p>

    return (
        <div>
            <h2>Knowledge Base</h2>
            <form className="inline-form" onSubmit={submit}>
                <input placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required/>
                <textarea placeholder="Content" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} reuired/>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <button type="submit">Add Article</button>
            </form>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Views</th>
                        <th>Published</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {articles.map(a => (
                        <tr key={a._id}>
                            <td>{a.title}</td>
                            <td>{a.category}</td>
                            <td>{a.views}</td>
                            <td>{a.isPublished ? 'Yes' : 'No'}</td>
                            <td><button className="btn-danger" onClick={() => remove(a._id)}>Delete</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}