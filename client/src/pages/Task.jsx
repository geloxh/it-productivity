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
const PRIORITY_VARIANT = { Low: 'secondary', Medium: 'outline', High: 'default', Critical: 'destructive' }
const EMPTY = { title: '', priority: 'Medium', project: '' }

export default function Tasks() {
    const taskFetcher = useCallback(() => api.get('/tasks').then(d => d.tasks ?? d), [])
    const projectFetcher = useCallback(() => api.get('/projects').then(d => d.projects ?? d), [])
    const { data: tasks = [], loading: loadingTasks, reload } = useData(taskFetcher)
    const { data: projects = [] } = useData(projectFetcher)
    const [form, setForm] = useState(EMPTY)
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.project) return toast.error('Please select a project.')
        setSaving(true)
        try {
            await api.post('/tasks', form)
            toast.success('Task created.')
            setForm({ ...EMPTY, project: form.project })
            setShowForm(false)
            reload()
        } catch (err) {
            toast.error(err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id) => {
        try {
            await api.delete(`/tasks/${id}`)
            toast.success('Task deleted.')
            reload()
        } catch (err) {
            toast.error(err.message)
        }
    }

    const filtered = tasks.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.project?.name?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="assets-root">
            <div className="dash-toolbar">
                <span className="dash-title">Tasks</span>
                <div className="dash-toolbar-right">
                    <Input placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} className="assets-search" />
                    <Button size="sm" onClick={() => setShowForm(true)}>+ Add Task</Button>
                </div>
            </div>

            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <div className="assets-field">
                            <label>Title *</label>
                            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                        </div>
                        <div className="assets-field">
                            <label>Project *</label>
                            <Select value={form.project} onValueChange={v => setForm(f => ({ ...f, project: v }))} required>
                                <SelectTrigger><SelectValue placeholder="Select Project" /></SelectTrigger>
                                <SelectContent>{projects.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="assets-field">
                            <label>Priority</label>
                            <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Task'}</Button>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="assets-grid">
                {loadingTasks ? (
                    <div className="p-4 space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead><TableHead>Project</TableHead>
                                <TableHead>Priority</TableHead><TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 && (
                                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-10">No tasks found.</TableCell></TableRow>
                            )}
                            {filtered.map(t => (
                                <TableRow key={t._id}>
                                    <TableCell className="font-medium">{t.title}</TableCell>
                                    <TableCell>{t.project?.name ?? '—'}</TableCell>
                                    <TableCell><Badge variant={PRIORITY_VARIANT[t.priority]}>{t.priority}</Badge></TableCell>
                                    <TableCell>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm">Delete</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <p>Delete <strong>{t.title}</strong>? This cannot be undone.</p>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(t._id)}>Delete</AlertDialogAction>
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
                <span>{filtered.length} task{filtered.length !== 1 ? 's' : ''}{search ? ' (filtered)' : ''}</span>
                <span>{tasks.length} total</span>
            </div>
        </div>
    )
}