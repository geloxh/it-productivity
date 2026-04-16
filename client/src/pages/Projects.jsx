import { useState, useCallback } from 'react'
import { api } from '../api/index'
import { useData } from '../hooks/useData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']
const PRIORITY_VARIANT = { Low: 'secondary', Medium: 'outline', High: 'default', Critical: 'destructive' }

export default function Projects() {
    const fetcher = useCallback(() => api.get('/projects').then(d => d.projects ?? d), [])
    const { data: projects, loading, reload } = useData(fetcher)
    const [form, setForm] = useState({ name: '', description: '', priority: 'Medium' })

    const submit = async (e) => {
        e.preventDefault()
        await api.post('/projects', form)
        toast.success('Project created.')
        setForm({ name: '', description: '', priority: 'Medium' })
        reload()
    }

    const remove = async (id) => {
        await api.delete(`/projects/${id}`)
        toast.success('Project deleted.')
        reload()
    }

    return (
        <div className="space-y-4">
            <h2>Projects</h2>
            <form className="flex flex-wrap gap-2" onSubmit={submit}>
                <Input placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                <Input placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
                <Button type="submit">Add Project</Button>
            </form>
            {loading ? (
                <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead><TableHead>Priority</TableHead><TableHead></TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                        {projects.map(p => (
                            <TableRow key={p._id}>
                                <TableCell>{p.name}</TableCell>
                                <TableCell>{p.status}</TableCell>
                                <TableCell><Badge variant={PRIORITY_VARIANT[p.priority]}>{p.priority}</Badge></TableCell>
                                <TableCell><Button variant="destructive" size="sm" onClick={() => remove(p._id)}>Delete</Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}