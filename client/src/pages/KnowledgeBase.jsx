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
    const { data: articles, loading, reload } = useData(fetcher)
    const [form, setForm] = useState({ title: '', content: '', category: 'General' })
    const [showForm, setShowForm] = useState(false)
    

    const submit = async (e) => {
        e.preventDefault()
        await api.post('/knowledge-base', form)
        toast.success('Article added.')
        setForm({ title: '', content: '', category: 'General' })
        reload()
    }

        const remove = async (id) => {
        await api.delete(`/knowledge-base/${id}`)
        toast.success('Article deleted.')
        reload()
    }

    return (
        <div className="space-y-4">
            <h2>Knowledge Base</h2>
            <form className="flex flex-wrap gap-2" onSubmit={submit}>
                <Input placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                <Input placeholder="Content" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required />
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Button type="submit">Add Article</Button>
            </form>
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
                        {articles.map(a => (
                            <TableRow key={a._id}>
                                <TableCell>{a.title}</TableCell>
                                <TableCell><Badge variant="outline">{a.category}</Badge></TableCell>
                                <TableCell>{a.views ?? 0}</TableCell>
                                <TableCell><Badge variant={a.isPublished ? 'default' : 'secondary'}>{a.isPublished ? 'Yes' : 'No'}</Badge></TableCell>
                                <TableCell><Button variant="destructive" size="sm" onClick={() => remove(a._id)}>Delete</Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}