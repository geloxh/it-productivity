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

const CATEGORIES = ['Laptop', 'Desktop', 'Server', 'Network', 'Peripheral', 'Software', 'Mobile']
const STATUSES = ['Available', 'Assigned', 'Maintenance', 'Retired', 'Lost']
const EQUIPMENT_STATUSES = ['Good', 'Defective', 'For Repair', 'For Disposal']
const CONTRACT_STATUSES = ['Active', 'Expired', 'None']
const STATUS_VARIANT = { Available: 'secondary', Assigned: 'default', Maintenance: 'outline', Retired: 'secondary', Lost: 'destructive' }

const EMPTY = {
    name: '', assetTag: '', category: 'Laptop',
    serialNumber: '', manufacturer: '', model: '',
    deviceYearModel: '', systemInfo: '', user: '',
    formerUser: '', company: '', contractStatus: 'None',
    equipmentStatus: 'Good', dateAcquired: '', notes: ''
}

const FIELDS = [
    { key: 'assetTag', label: 'Asset Tag', required: true },
    { key: 'name', label: 'Name / Label', required: true },
    { key: 'user', label: 'User' },
    { key: 'formerUser', label: 'Former User' },
    { key: 'serialNumber', label: 'Serial No.' },
    { key: 'manufacturer', label: 'Brand / Manufacturer' },
    { key: 'model', label: 'Model' },
    { key: 'deviceYearModel', label: 'Year Model' },
    { key: 'systemInfo', label: 'System Info (OS, CPU, RAM...)' },
    { key: 'company', label: 'Company' },
    { key: 'notes', label: 'Notes' },
]

export default function Assets() {
    const fetcher = useCallback(() => api.get('/assets').then(d => d.assets ?? d), [])
    const { data: assets = [], loading, reload } = useData(fetcher)
    const [form, setForm] = useState(EMPTY)
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState('')

    const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))
    const setVal = (key) => (v) => setForm(f => ({ ...f, [key]: v }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const res = await api.post('/assets', form)
            if (res.error) return toast.error(res.error)
            toast.success('Asset added.')
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
        const res = await api.delete(`/assets/${id}`)
        if (res.error) return toast.error(res.error)
        toast.success('Asset deleted.')
        reload()
    }

    const handleStatusChange = async (id, status) => {
        const res = await api.patch(`/assets/${id}`, { status })
        if (res.error) return toast.error(res.error)
        reload()
    }

    const filtered = assets.filter(a =>
        [a.name, a.assetTag, a.user, a.serialNumber].some(v =>
            v?.toLowerCase().includes(search.toLowerCase())
        )
    )

    return (
        <div className="assets-root">
            {/* Toolbar */}
            <div className="dash-toolbar">
                <span className="dash-title">Asset Inventory</span>
                <div className="dash-toolbar-right">
                    <Input
                        placeholder="Search name, tag, user, serial..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="assets-search"
                    />
                    <Button size="sm" onClick={() => setShowForm(true)}>+ Add Asset</Button>
                </div>
            </div>

            {/* Add Asset Dialog */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add Asset</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="assets-form">
                        {FIELDS.map(({ key, label, required }) => (
                            <div key={key} className="assets-field">
                                <label>{label}{required && ' *'}</label>
                                <Input value={form[key]} onChange={set(key)} required={required} />
                            </div>
                        ))}
                        <div className="assets-field">
                            <label>Category</label>
                            <Select value={form.category} onValueChange={setVal('category')}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="assets-field">
                            <label>Contract Status</label>
                            <Select value={form.contractStatus} onValueChange={setVal('contractStatus')}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{CONTRACT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="assets-field">
                            <label>Equipment Status</label>
                            <Select value={form.equipmentStatus} onValueChange={setVal('equipmentStatus')}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{EQUIPMENT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="assets-field">
                            <label>Date Acquired</label>
                            <Input type="date" value={form.dateAcquired} onChange={set('dateAcquired')} />
                        </div>
                        <div className="assets-form-footer">
                            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Asset'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Data Grid */}
            <div className="assets-grid">
                {loading ? (
                    <div className="p-4 space-y-2">
                        {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Asset Tag</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Serial No.</TableHead>
                                <TableHead>System Info</TableHead>
                                <TableHead>Brand</TableHead>
                                <TableHead>Model</TableHead>
                                <TableHead>Year</TableHead>
                                <TableHead>Former User</TableHead>
                                <TableHead>Contract</TableHead>
                                <TableHead>Acquired</TableHead>
                                <TableHead>Equip.</TableHead>
                                <TableHead>Notes</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={17} className="text-center text-muted-foreground py-10">
                                        No assets found.
                                    </TableCell>
                                </TableRow>
                            )}
                            {filtered.map(a => (
                                <TableRow key={a._id}>
                                    <TableCell><code>{a.assetTag || '—'}</code></TableCell>
                                    <TableCell className="font-medium">{a.name || '—'}</TableCell>
                                    <TableCell>{a.user || '—'}</TableCell>
                                    <TableCell>{a.category}</TableCell>
                                    <TableCell><code>{a.serialNumber || '—'}</code></TableCell>
                                    <TableCell className="max-w-[140px] truncate" title={a.systemInfo}>{a.systemInfo || '—'}</TableCell>
                                    <TableCell>{a.manufacturer || '—'}</TableCell>
                                    <TableCell>{a.model || '—'}</TableCell>
                                    <TableCell>{a.deviceYearModel || '—'}</TableCell>
                                    <TableCell>{a.formerUser || '—'}</TableCell>
                                    <TableCell>{a.contractStatus || '—'}</TableCell>
                                    <TableCell>{a.dateAcquired ? new Date(a.dateAcquired).toLocaleDateString() : '—'}</TableCell>
                                    <TableCell>{a.equipmentStatus || '—'}</TableCell>
                                    <TableCell className="max-w-[100px] truncate" title={a.notes}>{a.notes || '—'}</TableCell>
                                    <TableCell>{a.company || '—'}</TableCell>
                                    <TableCell>
                                        <Select value={a.status} onValueChange={v => handleStatusChange(a._id, v)}>
                                            <SelectTrigger className="w-28 h-7">
                                                <Badge variant={STATUS_VARIANT[a.status] ?? 'outline'}>{a.status}</Badge>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm">Delete</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <p>Delete <strong>{a.name}</strong>? This cannot be undone.</p>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(a._id)}>Delete</AlertDialogAction>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Status bar */}
            <div className="dash-statusbar">
                <span>{filtered.length} asset{filtered.length !== 1 ? 's' : ''}{search ? ' (filtered)' : ''}</span>
                <span>{assets.filter(a => a.status === 'Available').length} available · {assets.filter(a => a.status === 'Assigned').length} assigned</span>
            </div>
        </div>
    )
}