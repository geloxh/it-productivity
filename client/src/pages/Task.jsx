import { useEffect, useState } from 'react'
import { api } from '../api/index'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const PRIORITY_VARIANT = { Low: 'secondary', Medium: 'outline', High: 'default', Critical: 'destructive' }

export default function Tasks() {
    const [tasks, setTasks] = useState([])
    const [projects, setProjects] = useState([])
    const [form, setForm] = useState({ title: '', priority: 'Medium', project: '' })
    const [loading, setLoading] = useState(true)

    const load = () => Promise.all([
        api.get('/tasks').then(d => setTasks(d.tasks ?? d)),
        api.get('/projects').then(d => setProjects(d.projects ?? d))
    ]).catch(() => toast.error('Failed to load tasks.')).finally(() => setLoading(false))

    useEffect(() => { load() }, [])

    const submit = async (e) => {
        e.preventDefault()
        await api.post('/tasks', form)
        toast.success('Task added.')
        setForm({ title: '', priority: 'Medium', project: form.project })
        load()
    }

    const remove = async (id) => {
        await api.delete(`/tasks/${id}`)
        toast.success('Task deleted.')
        load()
    }

    if (loading) return <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>

    return (
        <div className="space-y-4">
            <h2>Tasks</h2>
            <form className="flex flex-wrap gap-2" onSubmit={submit}>
                <Input placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                <Select value={form.project} onValueChange={v => setForm(f => ({ ...f, project: v }))} required>
                    <SelectTrigger className="w-44"><SelectValue placeholder="Select Project" /></SelectTrigger>
                    <SelectContent>{projects.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>{['Low','Medium','High','Critical'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
                <Button type="submit">Add Task</Button>
            </form>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead><TableHead>Project</TableHead>
                        <TableHead>Priority</TableHead><TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tasks.map(t => (
                        <TableRow key={t._id}>
                            <TableCell>{t.title}</TableCell>
                            <TableCell>{t.project?.name ?? t.project}</TableCell>
                            <TableCell><Badge variant={PRIORITY_VARIANT[t.priority]}>{t.priority}</Badge></TableCell>
                            <TableCell><Button variant="destructive" size="sm" onClick={() => remove(t._id)}>Delete</Button></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}