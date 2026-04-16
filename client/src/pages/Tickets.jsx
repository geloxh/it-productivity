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

// Constants - lookup maps for color badge
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']
const PRIORITY_VARIANT = { Low: 'secondary', Medium: 'outline', High: 'default', Critical: 'destructive' }
const STATUS_VARIANT = { Open: 'default', 'In-Progress': 'outline', Resolved: 'secondary', Closed: 'secondary' }

export default function Tickets() {
    const fetcher = useCallback(() => api.get('/tickets').then(d => d.tickets ?? d), []) // Data fetching
    const { data: tickets, loading, reload } = useData(fetcher)

    // form state & submission
    const [form, setForm] = useState({ title: '', description: '', priority: 'Low' }) 

    const submit = async (e) => {
        e.preventDefault()
        await api.post('/tickets', form)
        toast.success('Ticket created.')
        setForm({ title: '', description: '', priority: 'Low' })
        reload()
    }

    const remove = async (id) => { // Delete handler
        await api.delete(`/tickets/${id}`)
        toast.success('Ticket deleted.')
        reload()
    }

    return (
        <div className="space-y-4">
            <h2>Tickets</h2>
            <form className="flex flex-wrap gap-2" onSubmit={submit}>
                <Input placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                <Input placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
                <Button type="submit">Add Ticket</Button>
            </form>
            {loading ? (
                <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow><TableHead>Title</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                        {tickets.map(t => (
                            <TableRow key={t._id}>
                                <TableCell>{t.title}</TableCell>
                                <TableCell><Badge variant={PRIORITY_VARIANT[t.priority]}>{t.priority}</Badge></TableCell>
                                <TableCell><Badge variant={STATUS_VARIANT[t.status]}>{t.status}</Badge></TableCell>
                                <TableCell><Button variant="destructive" size="sm" onClick={() => remove(t._id)}>Delete</Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}