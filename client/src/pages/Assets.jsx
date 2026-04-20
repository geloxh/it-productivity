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

const CATEGORIES = ['Laptop', 'Desktop', 'Server', 'Network', 'Peripheral', 'Software', 'Mobile']
const EMPTY = { name: '', assetTag: '', category: 'Laptop', manufacturer: '', model: '', serialNumber: '' }
const STATUS_VARIANT = { Available: 'secondary', Assigned: 'default', Maintenance: 'outline', Retired: 'secondary', Lost: 'destructive' }

export default function Assets() {
    const fetcher = useCallback(() => api.get('/assets').then(d => d.assets ?? d), [])
    const { data: assets, loading, reload } = useData(fetcher)
    const [form, setForm] = useState(EMPTY)
    const [showForm, setShowForm] = useState(false)

    const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        const res = await api.post('/assets', form)
        if (res.error) return toast.error(res.error)
        toast.success('Asset added.')
        setForm(EMPTY)
        setShowForm(false)
        reload()
    }

    const handleDelete = async (id) => {
        const prev = assets
        setAssets(a => a.filter(x => x.id !== id))
        const res = await api.delete(`/assets/${id}`)
        if (res.error) {
            setAssets(prev)
            return toast.error(res.error)
        }
        toast.success('Asset deleted.')
    }

    return (
        <div className="space-y-4">
            <div className="page-header">
                <h2>Assets</h2>
                <Button variant={showForm ? 'outline' : 'default'} onClick={() => setShowForm(v => !v)}>
                    {showForm ? 'Cancel' : '+ Add Asset'}
                </Button>
            </div>

            {showForm && (
                <form className="asset-form" onSubmit={handleSubmit}>
                    <Input placeholder="Name *" value={form.name} onChange={set('name')} required />
                    <Input placeholder="Asset Tag *" value={form.assetTag} onChange={set('assetTag')} required />
                    <Input placeholder="Serial No." value={form.serialNumber} onChange={set('serialNumber')} />
                    <Input placeholder="Manufacturer" value={form.manufacturer} onChange={set('manufacturer')} />
                    <Input placeholder="Model" value={form.model} onChange={set('model')} />
                    <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button type="submit">Save Asset</Button>
                </form>
            )}

            {loading ? (
                <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead><TableHead>Tag</TableHead><TableHead>Category</TableHead>
                            <TableHead>Manufacturer</TableHead><TableHead>Model</TableHead>
                            <TableHead>Status</TableHead><TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {assets.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No assets found.</TableCell></TableRow>}
                        {assets.map(a => (
                            <TableRow key={a._id}>
                                <TableCell>{a.name}</TableCell>
                                <TableCell><code>{a.assetTag}</code></TableCell>
                                <TableCell>{a.category}</TableCell>
                                <TableCell>{a.manufacturer}</TableCell>
                                <TableCell>{a.model || '—'}</TableCell>
                                <TableCell><Badge variant={STATUS_VARIANT[a.status] ?? 'outline'}>{a.status}</Badge></TableCell>
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
    )
} 