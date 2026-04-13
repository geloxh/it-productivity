import { useEffect, useState } from 'react'

const BASE = '/api/v1/assets'
const api = {
    getAll: () => fetch(BASE, { credentials: 'include' }).then(r => r.json()),
    create: (body) => fetch(BASE, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()),
    delete: (id) => fetch(`${BASE}/${id}`, { method: 'DELETE', credentials: 'include' }).then(r => r.json()),
}

const CATEGORIES = ['Laptop', 'Desktop', 'Server', 'Network', 'Peripheral', 'Software', 'Mobile']
const EMPTY_FORM = { name: '', assetTag: '', category: 'Laptop', manufacturer: '', model: '', serialNumber: '' } 

export default function Assets() {
    const [assets, setAssets] = useState([])
    const [form, setForm] = useState(EMPTY_FORM)
    const [showForm, setShowForm] = useState(false)
    const [error, setError] = useState(null)

    useEffect (() => { load() }, [])

    const load = () => api.getAll().then(setAssets).catch(() => setError('Failed to load assets.'))

    const handleSubmit = async (e) => {
        e.preventDefault()
        const res = await api.create(form)
        if (res.error) return setError(res.error)
            setForm(EMPTY_FORM)
            setShowForm(false)
            load()
    }

    const handleDelete =  async (id) => {
        if (!confirm('Delete this asset?')) return
        await api.delete(id)
        load()
    }

    return (
        <div>
            <div className="page-header">
                <h2>Assets</h2>
                <button onClick={() => setShowForm(v => !v)}>
                    {showForm ? 'Cancel' : '+ Add Asset'}
                </button>
            </div>

            { error && <p className="error">{error}</p>}

            {showForm && (
                <form className="asset-form" onSubmit={handleSubmit}>
                    <input placeholder="Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required/>
                    <input placeholder="Asset Tag *" value={form.assetTag} onChange={e => setForm(f => ({ ...f, assetTag: e.target.value }))} required/>
                    <input placeholder="Serial No." value={form.serialNumber} onChange={e => setForm(f => ({ ...f, serialNumber: e.target.value }))}/>
                    <input placeholder="Manufacturer" value={form.manufacturer} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} />
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <button type="submit">Save Asset</button>
                </form>
            )}

            <table className="asset-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Tag</th>
                        <th>Category</th>
                        <th>Manufacturer</th>
                        <th>Model</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {assets.length === 0 && (
                        <tr>
                            <td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>No assets found.</td>
                        </tr>
                    )}
                    {assets.map( a => (
                        <tr key={a._id}>
                            <td>{a.name}</td>
                            <td><code>{a.assetTag}</code></td>
                            <td>{a.category}</td>
                            <td>{a.manufacturer}</td>
                            <td>{a.model || '—'}</td>
                            <td><span className={`badge badge-${a.status?.toLowerCase()}`}>{a.status}</span></td>
                            <td><button className="btn-danger" onClick={() => handleDelete(a._id)}>Delete</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}