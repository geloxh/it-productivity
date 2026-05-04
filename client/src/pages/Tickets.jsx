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
const CATEGORIES = ['Hardware', 'Software', 'Network', 'Access', 'Other']
const PRIORITY_VARIANT = { Low: 'secondary', Medium: 'outline', High: 'default', Critical: 'destructive' }
const STATUS_VARIANT = { Open: 'default', 'In-Progress': 'outline', Resolved: 'secondary', Closed: 'secondary' }
const EMPTY = { title: '', description: '', priority: 'Low', category: 'Other', assignedTo: '' }

export default function Tickets() {
    const fetcher = useCallback(() => api.get('/tickets').then(d => d.tickets ?? d), [])
    const { data: tickets = [], loading, reload } = useData(fetcher)
    const usersFetcher = useCallback(() => api.get('/users'), [])
    const { data: users = [] } = useData(usersFetcher)

    const [form, setForm] = useState(EMPTY)
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [filterPriority, setFilterPriority] = useState('all')
    const [filterCategory, setFilterCategory] = useState('all')
    const [selected, setSelected] = useState(new Set())
    const [allPagesSelected, setAllPagesSelected] = useState(false)
    const [showImport, setShowImport] = useState(false)
    const [detailTicket, setDetailTicket] = useState(null)
    const [editForm, setEditForm] = useState(null)
    const [commentText, setCommentText] = useState('')
    const [commentSaving, setCommentSaving] = useState(false)
    const undoRef = useRef(null)

    const filtered = tickets.filter(t => {
        const matchText = t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.description?.toLowerCase().includes(search.toLowerCase())
        const matchStatus = filterStatus === 'all' || t.status === filterStatus
        const matchPriority = filterPriority === 'all' || t.priority === filterPriority
        const matchCategory = filterCategory === 'all' || t.category === filterCategory
        return matchText && matchStatus && matchPriority && matchCategory
    })

    const toggleRow = (id) => setSelected(s => {
        const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id)
        setAllPagesSelected(false); return n
    })
    const togglePageAll = () => {
        const pageIds = filtered.map(t => t._id)
        const allChecked = pageIds.every(id => selected.has(id))
        setSelected(allChecked ? new Set() : new Set(pageIds)); setAllPagesSelected(false)
    }
    const selectAllPages = () => { setSelected(new Set(filtered.map(t => t._id))); setAllPagesSelected(true) }
    const clearSelection = () => { setSelected(new Set()); setAllPagesSelected(false) }
    const activeIds = allPagesSelected ? filtered.map(t => t._id) : [...selected]

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true)
        try {
            await api.post('/tickets', { ...form, assignedTo: form.assignedTo === 'unassigned' ? undefined : form.assignedTo || undefined })
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

    const openDetail = (ticket) => {
        setDetailTicket(ticket)
        setEditForm({ ...ticket, assignedTo: ticket.assignedTo?._id ?? 'unassigned' })
    }
    const closeDetail = () => { setDetailTicket(null); setEditForm(null); setCommentText('') }

    const handleEditSave = async () => {
        setSaving(true)
        try {
            await api.put(`/tickets/${detailTicket._id}`, {
                title: editForm.title, description: editForm.description,
                priority: editForm.priority, status: editForm.status,
                category: editForm.category,
                assignedTo: editForm.assignedTo === 'unassigned' ? undefined : editForm.assignedTo || undefined
            })
            toast.success('Ticket updated.'); reload(); closeDetail()
        } catch (err) { toast.error(err.message) }
        finally { setSaving(false) }
    }

    const handleAddComment = async (e) => {
        e.preventDefault(); if (!commentText.trim()) return
        setCommentSaving(true)
        try {
            const updated = await api.post(`/tickets/${detailTicket._id}/comments`, { text: commentText })
            setCommentText(''); setDetailTicket(updated); reload()
        } catch (err) { toast.error(err.message) }
        finally { setCommentSaving(false) }
    }

    const bulkUpdateStatus = async (status) => {
        try {
            await api.patch('/tickets/bulk', { ids: activeIds, update: { status } })
            toast.success(`${activeIds.length} tickets updated.`); clearSelection(); reload()
        } catch (err) { toast.error(err.message) }
    }

    const handleUndo = async (snapshot) => {
        try {
            await Promise.all(snapshot.map(t => api.post('/tickets', {
                title: t.title, description: t.description, priority: t.priority, status: t.status
            })))
            toast.success(`${snapshot.length} tickets restored.`); reload()
        } catch (err) { toast.error('Undo failed: ' + err.message) }
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
                action: { label: 'Undo', onClick: () => handleUndo(snapshot) }, duration: 10000,
            })
        } catch (err) { toast.error(err.message) }
    }

    const bulkExport = () => {
        const rows = tickets.filter(t => activeIds.includes(t._id))
        const csv = [
            ['Title', 'Description', 'Category', 'Priority', 'Status'].join(','),
            ...rows.map(t => [t.title, t.description, t.category, t.priority, t.status]
                .map(v => `"${String(v ?? '').replace(/"/g, '""')}`).join(','))
        ].join('\n')
        const a = document.createElement('a')
        a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
        a.download = 'tickets.csv'; a.click()
    }

    const handleImport = async (ticketRows) => {
        try {
            await Promise.all(ticketRows.map(t => api.post('/tickets', t)))
            toast.success(`${ticketRows.length} tickets imported.`); reload()
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
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="filter-select"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                        <SelectTrigger className="filter-select"><SelectValue placeholder="Priority" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Priorities</SelectItem>
                            {PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="filter-select"><SelectValue placeholder="Category" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" onClick={() => setShowImport(true)}>Import</Button>
                    <Button size="sm" onClick={() => setShowForm(true)}>+ Add Ticket</Button>
                </div>
            </div>

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

            {someChecked && (
                <div className="bulk-action-bar">
                    <span className="bulk-action-count">{activeIds.length} selected</span>
                    <Select onValueChange={bulkUpdateStatus}>
                        <SelectTrigger className="status-select"><SelectValue placeholder="Set status…" /></SelectTrigger>
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

            {/* Add Ticket Modal */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="dialog-md">
                    <DialogHeader><DialogTitle>Add Ticket</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="dialog-form">
                        <div className="assets-field">
                            <label>Title *</label>
                            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                        </div>
                        <div className="assets-field">
                            <label>Description *</label>
                            <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
                        </div>
                        <div className="assets-field">
                            <label>Category</label>
                            <Select value={form.category} onValueChange={v =>                             setForm(f => ({ ...f, category: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="assets-field">
                            <label>Priority</label>
                            <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="assets-field">
                            <label>Assign To</label>
                            <Select value={form.assignedTo || 'unassigned'} onValueChange={v => setForm(f => ({ ...f, assignedTo: v === 'unassigned' ? '' : v }))}>
                                <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    {users.map(u => <SelectItem key={u._id} value={u._id}>{u.name ?? u.email}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Ticket'}</Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Detail / Edit Modal */}
            {detailTicket && (
                <Dialog open={!!detailTicket} onOpenChange={closeDetail}>
                    <DialogContent className="ticket-modal-content">
                        {editForm && (
                            <div className="ticket-modal-body">
                                <div className="ticket-modal-left">
                                    <span className="ticket-modal-section-label">Ticket Detail</span>
                                    <div className="assets-field">
                                        <label>Title</label>
                                        <Input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
                                    </div>
                                    <div className="assets-field">
                                        <label>Description</label>
                                        <textarea
                                            className="ticket-modal-textarea"
                                            value={editForm.description}
                                            onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                                            rows={4}
                                        />
                                    </div>
                                    {[
                                        { label: 'Category', key: 'category', options: CATEGORIES },
                                        { label: 'Priority', key: 'priority', options: PRIORITIES },
                                        { label: 'Status', key: 'status', options: STATUSES },
                                    ].map(({ label, key, options }) => (
                                        <div key={key} className="ticket-modal-prop-row">
                                            <span className="ticket-modal-prop-label">{label}</span>
                                            <Select value={editForm[key]} onValueChange={v => setEditForm(f => ({ ...f, [key]: v }))}>
                                                <SelectTrigger className="status-select"><SelectValue /></SelectTrigger>
                                                <SelectContent>{options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                    ))}
                                    <div className="ticket-modal-prop-row">
                                        <span className="ticket-modal-prop-label">Assigned</span>
                                        <Select value={editForm.assignedTo || 'unassigned'} onValueChange={v => setEditForm(f => ({ ...f, assignedTo: v === 'unassigned' ? '' : v }))}>
                                            <SelectTrigger className="status-select"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                                {users.map(u => <SelectItem key={u._id} value={u._id}>{u.name ?? u.email}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="ticket-modal-save">
                                        <Button size="sm" onClick={handleEditSave} disabled={saving} className="w-full">
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </div>

                                <div className="ticket-modal-right">
                                    <div className="ticket-modal-comments-header">
                                        <span className="ticket-modal-section-label">
                                            Comments ({detailTicket.comments?.length ?? 0})
                                        </span>
                                    </div>
                                    <div className="ticket-modal-comments-list">
                                        {!detailTicket.comments?.length && (
                                            <span className="ticket-modal-comment-empty">No comments yet.</span>
                                        )}
                                        {detailTicket.comments?.map((c, i) => (
                                            <div key={i} className="ticket-modal-comment">
                                                <div className="ticket-modal-comment-meta">
                                                    <span className="ticket-modal-comment-author">{c.user?.name ?? c.user?.email ?? 'User'}</span>
                                                    <span className="ticket-modal-comment-time">{new Date(c.createdAt).toLocaleString()}</span>
                                                </div>
                                                <p className="ticket-modal-comment-text">{c.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <form onSubmit={handleAddComment} className="ticket-modal-comment-form">
                                        <Input className="ticket-modal-comment-input" placeholder="Add a comment..." value={commentText} onChange={e => setCommentText(e.target.value)} />
                                        <Button type="submit" size="sm" disabled={commentSaving || !commentText.trim()}>Post</Button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            )}

            <BulkImportModal open={showImport} onClose={() => setShowImport(false)} onImport={handleImport} />

            <div className="assets-grid">
                {loading ? (
                    <div className="page-skeleton">{[...Array(6)].map((_, i) => <Skeleton key={i} />)}</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-8">
                                    <input type="checkbox" checked={allPageChecked} onChange={togglePageAll} className="bulk-checkbox" aria-label="Select all on page" />
                                </TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Assigned To</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="table-empty">No tickets found.</TableCell>
                                </TableRow>
                            )}
                            {filtered.map(t => (
                                <TableRow key={t._id} className={selected.has(t._id) ? 'bulk-row-selected' : ''}>
                                    <TableCell>
                                        <input type="checkbox" checked={selected.has(t._id)} onChange={() => toggleRow(t._id)} className="bulk-checkbox" aria-label={`Select ${t.title}`} />
                                    </TableCell>
                                    <TableCell className="table-cell-title" onClick={() => openDetail(t)}>
                                        {t.title}
                                    </TableCell>
                                    <TableCell><Badge variant="outline">{t.category ?? 'Other'}</Badge></TableCell>
                                    <TableCell><Badge variant={PRIORITY_VARIANT[t.priority]}>{t.priority}</Badge></TableCell>
                                    <TableCell>
                                        <Select value={t.status} onValueChange={v => handleStatusChange(t._id, v)}>
                                            <SelectTrigger className="status-select">
                                                <Badge variant={STATUS_VARIANT[t.status] ?? 'outline'}>{t.status}</Badge>
                                            </SelectTrigger>
                                            <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="table-cell-muted">
                                        {t.assignedTo?.name ?? t.assignedTo?.email ?? '—'}
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

