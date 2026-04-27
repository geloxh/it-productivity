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

const CATEGORIES = ['Hardware', 'Software', 'Network', 'Security', 'General']
const EMPTY = { title: '', content: '', category: 'General' }

export default function KnowledgeBase() {
    const fetcher = useCallback(() => api.get('/knowledge-base').then(d => d.articles ?? d), [])
    const { data: articles = [], loading, reload } = useData(fetcher)
    const [form, setForm] = useState(EMPTY)
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState('')

    const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

    const submit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const res = await api.post('/knowledge-base', form)
            if (res.error) return toast.error(res.error)
            toast.success('Article added.')
            setForm(EMPTY)
            setShowForm(false)
            reload()
        } catch (err) {
            toast.error(err.message)
        } finally {
            setSaving(false)
        }
    }

    const remove = async (id) => {
        try {
            const res = await api.delete(`/knowledge-base/${id}`)
            if (res.error) return toast.error(res.error)
            toast.success('Article deleted.')
            reload()
        } catch (err) {
            toast.error(err.message)
        }
    }

    const togglePublish = async (id, current) => {
        try {
            const res = await api.patch(`/knowledge-base/${id}`, { isPublished: !current })
            if (res.error) return toast.error(res.error)
            reload()
        } catch (err) {
            toast.error(err.message)
        }
    }

    const filtered = articles.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.category.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-4">
            <div className="page-header">
                <h2>Knowledge Base</h2>
                <Button variant={showForm ? 'outline' : 'default'} onClick={() => setShowForm(v => !v)}>
                    {showForm ? 'Cancel' : '+ Add Article'}
                </Button>
            </div>

            {showForm && (
                <form className="asset-form" onSubmit={submit}>
                    <Input placeholder="Title *" value={form.title} onChange={set('title')} required />
                    <Input placeholder="Content *" value={form.content} onChange={set('content')} required />
                    <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Article'}</Button>
                </form>
            )}

            <Input placeholder="Search by title or category..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />

            {loading ? (
                <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead><TableHead>Category</TableHead>
                            <TableHead>Views</TableHead><TableHead>Published</TableHead><TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 && (
                            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No articles found.</TableCell></TableRow>
                        )}
                        {filtered.map(a => (
                            <TableRow key={a._id}>
                                <TableCell>{a.title}</TableCell>
                                <TableCell><Badge variant="outline">{a.category}</Badge></TableCell>
                                <TableCell>{a.views ?? 0}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="sm" onClick={() => togglePublish(a._id, a.isPublished)}>
                                        <Badge variant={a.isPublished ? 'default' : 'secondary'}>
                                            {a.isPublished ? 'Published' : 'Draft'}
                                        </Badge>
                                    </Button>
                                </TableCell>
                                <TableCell>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm">Delete</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <p>Delete <strong>{a.title}</strong>? This cannot be undone.</p>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => remove(a._id)}>Delete</AlertDialogAction>
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
