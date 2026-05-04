import { useState, useCallback } from 'react'
import { api } from '../api/index'
import { useData } from '../hooks/useData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']
const STATUSES = ['Planning', 'Active', 'Pending', 'Completed', 'Cancelled']
const PRIORITY_VARIANT = { Low: 'secondary', Medium: 'outline', High: 'default', Critical: 'destructive' }
const STATUS_VARIANT = { Planning: 'outline', Active: 'default', Pending: 'secondary', Completed: 'secondary', Cancelled: 'destructive' }
const EMPTY = { name: '', description: '', priority: 'Medium' }

export default function Projects() {
    const fetcher = useCallback(() => api.get('/projects').then(d => d.projects ?? d), [])
    const { data: projects = [], loading, reload } = useData(fetcher)
    const [form, setForm] = useState(EMPTY)
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true)
        try {
            await api.post('/projects', form)
            toast.success('Project created.')
            setForm(EMPTY); setShowForm(false); reload()
        } catch (err) { toast.error(err.message) }
        finally { setSaving(false) }
    }

    const handleDelete = async (id) => {
        try { await api.delete(`/projects/${id}`); toast.success('Project deleted.'); reload() }
        catch (err) { toast.error(err.message) }
    }

    const handleStatusChange = async (id, status) => {
        try { await api.put(`/projects/${id}`, { status }); reload() }
        catch (err) { toast.error(err.message) }
    }

    const filtered = projects.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="assets-root">
            <div className="dash-toolbar">
                <span className="dash-title">Projects</span>
                <div className="dash-toolbar-right">
                    <Input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} className="assets-search" />
                    <Button size="sm" onClick={() => setShowForm(true)}>+ Add Project</Button>
                </div>
            </div>

            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="dialog-md">
                    <DialogHeader><DialogTitle>Add Project</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="dialog-form">
                        <div className="assets-field">
                            <label>Name *</label>
                            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                        </div>
                        <div className="assets-field">
                            <label>Description</label>
                            <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                        </div>
                        <div className="assets-field">
                            <label>Priority</label>
                            <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Project'}</Button>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="assets-grid">
                {loading ? (
                    <div className="page-skeleton">{[...Array(6)].map((_, i) => <Skeleton key={i} />)}</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead><TableHead>Description</TableHead>
                                <TableHead>Status</TableHead><TableHead>Priority</TableHead><TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 && (
                                <TableRow><TableCell colSpan={5} className="table-empty">No projects found.</TableCell></TableRow>
                            )}
                            {filtered.map(p => (
                                <TableRow key={p._id}>
                                    <TableCell className="table-cell-title">{p.name}</TableCell>
                                    <TableCell>{p.description || '—'}</TableCell>
                                    <TableCell>
                                        <Select value={p.status} onValueChange={v => handleStatusChange(p._id, v)}>
                                            <SelectTrigger className="status-select">
                                                <Badge variant={STATUS_VARIANT[p.status] ?? 'outline'}>{p.status}</Badge>
                                            </SelectTrigger>
                                            <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell><Badge variant={PRIORITY_VARIANT[p.priority]}>{p.priority}</Badge></TableCell>
                                    <TableCell>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm">Delete</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <p>Delete <strong>{p.name}</strong>? This cannot be undone.</p>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(p._id)}>Delete</AlertDialogAction>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            <div className="dash-statusbar">
                <span>{filtered.length} project{filtered.length !== 1 ? 's' : ''}{search ? ' (filtered)' : ''}</span>
                <span>{projects.filter(p => p.status === 'Active').length} active · {projects.filter(p => p.status === 'Completed').length} completed</span>
            </div>
        </div>
    )
}