import { useState, useCallback, useRef } from 'react'
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
import BulkImportModal from '../components/BulkImportModal'

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
    const [selected, setSelected] = useState(new Set())
    const [allPagesSelected, setAllPagesSelected] = useState(false)
    const [showImport, setShowImport] = useState(false)
    const undoRef = useRef(null)

    const filtered = tickets.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase())
    )

    // --- Selection ---
    const toggleRow = (id) => setSelected(s => {
        const n = new Set(s)
        n.has(id) ? n.delete(id) : n.add(id)
        setAllPagesSelected(false)
        return n
    })

    const togglePageAll = () => {
        const pageIds = filtered.map(t => t._id)
        const allChecked = pageIds.every(id => selected.has(id))
        setSelected(allChecked ? new Set() : new Set(pageIds))
        setAllPagesSelected(false)
    }

    const selectAllPages = () => {
        setSelected(new Set(filtered.map(t => t._id)))
        setAllPagesSelected(true)
    }

    const clearSelection = () => { setSelected(new Set()); setAllPagesSelected(false) }

    const activeIds = allPagesSelected ? filtered.map(t => t._id) : [...selected]

    // --- Single ops ---
    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true)
        try {
            await api.post('/tickets', form)
            toast.success('Ticket created.')
            setForm(EMPTY); setShowForm(false); reload()
        } catch (err) { toast.error(err.message) }
        finally { setSaving(false) }
    }

    const handleDelete = async (id) => {
        try { await api.delete(`/tickets/${id}`); toast.success('Ticket deleted.'); reload() }
        catch (err) { toast.error(err.message) }
    }

    const handleStatusChange = async (id, status) => {
        try { await api.put(`/tickets/${id}`, { status }); reload() }
        catch (err) { toast.error(err.message) }
    }

    // --- Bulk ops ---
    const bulkUpdateStatus = async (status) => {
        try {
            await api.patch('/tickets/bulk', { ids: activeIds, update: { status } })
            toast.success(`${activeIds.length} tickets updated.`)
            clearSelection(); reload()
        } catch (err) { toast.error(err.message) }
    }

    const bulkDelete = async () => {
        const snapshot = tickets.filter(t => activeIds.includes(t._id))
        try {
            await api.delete('/tickets/bulk', { ids: activeIds })
            clearSelection(); reload()
            const tid = toast(`${snapshot.length} tickets deleted.`, {
                action: { label: 'Undo', onClick: () => handleUndo(snapshot, tid) },
                duration: 10000,
            })
            undoRef.current = { snapshot, tid }
        } catch (err) { toast.error(err.message) }
    }

    const handleUndo = async (snapshot) => {
        try {
            await Promise.all(snapshot.map(t => api.post('/tickets', {
                title: t.title, description: t.description,
                priority: t.priority, status: t.status
            })))
            toast.success(`${snapshot.length} tickets restored.`)
            reload()
        } catch (err) { toast.error('Undo failed: ' + err.message) }
    }

    const bulkExport = () => {
        const rows = tickets.filter(t => activeIds.includes(t._id))
        const csv = [
            ['Title', 'Description', 'Priority', 'Status'].join(','),
            ...rows.map(t => [t.title, t.description, t.priority, t.status]
                .map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
        ].join('\n')
        const a = document.createElement('a')
        a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
        a.download = 'tickets.csv'; a.click()
    }

    const handleImport = async (ticketRows) => {
        try {
            await Promise.all(ticketRows.map(t => api.post('/tickets', t)))
            toast.success(`${ticketRows.length} tickets imported.`)
            reload()
        } catch (err) { toast.error(err.message) }
    }
    
    const bulkDeleteRequest = async () => {
        const snapshot = tickets.filter(t => activeIds.includes(t._id))
        try {
            await fetch('/api/v1/tickets/bulk', {
                method: 'DELETE', credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: activeIds })
            }).then(async r => { if (!r.ok) throw new Error((await r.json()).error) })
            clearSelection(); reload()
            toast(`${snapshot.length} tickets deleted.`, {
                action: { label: 'Undo', onClick: () => handleUndo(snapshot) },
                duration: 10000,
            })
        } catch (err) { toast.error(err.message) }
    }

    const pageIds = filtered.map(t => t._id)
    const allPageChecked = pageIds.length > 0 && pageIds.every(id => selected.has(id))
    const someChecked = selected.size > 0

    return (
        <div className="assets-root">
            <div className="dash-toolbar">
                <span className="dash-title">Tickets</span>
                <div className="dash-toolbar-right">
                    <Input placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} className="assets-search" />
                    <Button size="sm" variant="outline" onClick={() => setShowImport(true)}>Import</Button>
                    <Button size="sm" onClick={() => setShowForm(true)}>+ Add Ticket</Button>
                </div>
            </div>

            {/* Select-all-pages banner */}
            {someChecked && !allPagesSelected && selected.size === filtered.length && filtered.length < tickets.length && (
                <div className="bulk-select-banner">
                    {selected.size} tickets on this page selected.{' '}
                    <button className="bulk-select-banner-btn" onClick={selectAllPages}>
                        Select all {filtered.length} matching tickets
                    </button>
                </div>
            )}
            {allPagesSelected && (
                <div className="bulk-select-banner">
                    All {filtered.length} matching tickets selected.{' '}
                    <button className="bulk-select-banner-btn" onClick={clearSelection}>Clear selection</button>
                </div>
            )}

            {/* Floating action bar */}
            {someChecked && (
                <div className="bulk-action-bar">
                    <span className="bulk-action-count">{activeIds.length} selected</span>
                    <Select onValueChange={bulkUpdateStatus}>
                        <SelectTrigger className="h-7 w-36 text-xs bg-white"><SelectValue placeholder="Set status…" /></SelectTrigger>
                        <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" onClick={bulkExport}>Export CSV</Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">Delete {activeIds.length}</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <p>Delete <strong>{activeIds.length}</strong> tickets? You can undo within 10 seconds.</p>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={bulkDeleteRequest}>Delete</AlertDialogAction>
                        </AlertDialogContent>
                    </AlertDialog>
                    <button className="bulk-action-clear" onClick={clearSelection}>✕</button>
                </div>
            )}

            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Add Ticket</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <div className="assets-field">
                            <label>Title *</label>
                            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                        </div>
                        <div className="assets-field">
                            <label>Description *</label>
                            <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
                        </div>
                        <div className="assets-field">
                            <label>Priority</label>
                            <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Ticket'}</Button>
                    </form>
                </DialogContent>
            </Dialog>

            <BulkImportModal open={showImport} onClose={() => setShowImport(false)} onImport={handleImport} />

            <div className="assets-grid">
                {loading ? (
                    <div className="p-4 space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-8">
                                    <input type="checkbox" checked={allPageChecked} onChange={togglePageAll}
                                        className="bulk-checkbox" aria-label="Select all on page" />
                                </TableHead>
                                <TableHead>Title</TableHead><TableHead>Description</TableHead>
                                <TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 && (
                                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">No tickets found.</TableCell></TableRow>
                            )}
                            {filtered.map(t => (
                                <TableRow key={t._id} data-selected={selected.has(t._id)} className={selected.has(t._id) ? 'bulk-row-selected' : ''}>
                                    <TableCell>
                                        <input type="checkbox" checked={selected.has(t._id)} onChange={() => toggleRow(t._id)}
                                            className="bulk-checkbox" aria-label={`Select ${t.title}`} />
                                    </TableCell>
                                    <TableCell className="font-medium">{t.title}</TableCell>
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

            <div className="dash-statusbar">
                <span>{filtered.length} ticket{filtered.length !== 1 ? 's' : ''}{search ? ' (filtered)' : ''}</span>
                <span>{tickets.filter(t => t.status === 'Open').length} open · {tickets.filter(t => t.status === 'Resolved').length} resolved</span>
            </div>
        </div>
    )
}