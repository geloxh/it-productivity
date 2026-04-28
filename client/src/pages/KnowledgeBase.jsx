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

const CATEGORIES = ['Hardware', 'Software', 'Network', 'Security', 'General']
const EMPTY = { title: '', content: '', category: 'General' }

export default function KnowledgeBase() {
    const fetcher = useCallback(() => api.get('/knowledge-base').then(d => d.articles ?? d), [])
    const { data: articles = [], loading, reload } = useData(fetcher)
    const [form, setForm] = useState(EMPTY)
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState('')

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
        <div className="assets-root">
            <div className="dash-toolbar">
                <span className="dash-title">Knowledge Base</span>
                <div className="dash-toolbar-right">
                    <Input placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)} className="assets-search" />
                    <Button size="sm" onClick={() => setShowForm(true)}>+ Add Article</Button>
                </div>
            </div>

            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Add Article</DialogTitle></DialogHeader>
                    <form onSubmit={submit} className="flex flex-col gap-3">
                        <div className="assets-field">
                            <label>Title *</label>
                            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                        </div>
                        <div className="assets-field">
                            <label>Content *</label>
                            <Input value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required />
                        </div>
                        <div className="assets-field">
                            <label>Category</label>
                            <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Article'}</Button>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="assets-grid">
                {loading ? (
                    <div className="p-4 space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
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
                                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-10">No articles found.</TableCell></TableRow>
                            )}
                            {filtered.map(a => (
                                <TableRow key={a._id}>
                                    <TableCell className="font-medium">{a.title}</TableCell>
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

            <div className="dash-statusbar">
                <span>{filtered.length} article{filtered.length !== 1 ? 's' : ''}{search ? ' (filtered)' : ''}</span>
                <span>{articles.filter(a => a.isPublished).length} published · {articles.filter(a => !a.isPublished).length} draft</span>
            </div>
        </div>
    )
}
