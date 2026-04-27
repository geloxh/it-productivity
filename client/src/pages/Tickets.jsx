import { useState, useCallback } from 'react'
import { api } from '../api/index'
import { useData } from '../hooks/useData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']
const STATUSES = ['Open', 'In-Progress', 'Resolved', 'Closed']
const PRIORITY_VARIANT = { Low: 'secondary', Medium: 'outline', High: 'default', Critical: 'destructive' }
const STATUS_VARIANT = { Open: 'default', 'In-Progress': 'outline', Resolved: 'secondary', Closed: 'secondary' }
const EMPTY = { title: '', description: '', priority: 'Low' }

export default function Tickets() {
    const fetcher = useCallback(() => api.get('/tickets').then(d => d.tickets ?? d), [])
    const { data: tickets = [], loading, reload } = useData(fetcher)
    const [form, setForm] = useState(EMPTY)
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await api.post('/tickets', form)
            toast.success('Ticket created.')
            setForm(EMPTY)
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
            await api.delete(`/tickets/${id}`)
            toast.success('Ticket deleted.')
            reload()
        } catch (err) {
            toast.error(err.message)
        }
    }

    const handleStatusChange = async (id, status) => {
        try {
            await api.put(`/tickets/${id}`, { status })
            reload()
        } catch (err) {
            toast.error(err.message)
        }
    }

    const filtered = tickets.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-4">
            <div className="page-header">
                <h2>Tickets</h2>
                <Button variant={showForm ? 'outline' : 'default'} onClick={() => setShowForm(v => !v)}>
                    {showForm ? 'Cancel' : '+ Add Ticket'}
                </Button>
            </div>

            {showForm && (
                <form className="asset-form" onSubmit={handleSubmit}>
                    <Input placeholder="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                    <Input placeholder="Description *" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
                    <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Ticket'}</Button>
                </form>
            )}

            <Input placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />

            {loading ? (
                <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead><TableHead>Description</TableHead>
                            <TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 && (
                            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No tickets found.</TableCell></TableRow>
                        )}
                        {filtered.map(t => (
                            <TableRow key={t._id}>
                                <TableCell>{t.title}</TableCell>
                                <TableCell className="max-w-xs truncate">{t.description}</TableCell>
                                <TableCell><Badge variant={PRIORITY_VARIANT[t.priority]}>{t.priority}</Badge></TableCell>
                                <TableCell>
                                    <Select value={t.status} onValueChange={v => handleStatusChange(t._id, v)}>
                                        <SelectTrigger className="w-32 h-7">
                                            <Badge variant={STATUS_VARIANT[t.status] ?? 'outline'}>{t.status}</Badge>
                                        </SelectTrigger>
                                        <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                    </Select>
                                </TableCell>
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
    )
}