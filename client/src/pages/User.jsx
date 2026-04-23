import { useCallback, useState } from 'react'
import { api } from '../api/index'
import { useData } from '../hooks/useData'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

const ROLE_VARIANT = { SysAdmin: 'destructive', Admin: 'default', Employee: 'secondary', Guest: 'outline' }

export default function Users() {
    const fetcher = useCallback(() => api.get('/users').then(d => {
        const result = d.users ?? d
        return Array.isArray(result) ? result : []
    }), [])
    const { data: users = [], loading, reload } = useData(fetcher)
    const [search, setSearch] = useState('')

    const toggleActive = async (id, current) => {
        try {
            const res = await api.patch(`/users/${id}`, { isActive: !current })
            if (res.error) return toast.error(res.error)
            reload()
        } catch (err) {
            toast.error(err.message)
        }
    }

    const filtered = users.filter(u =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-4">
            <div className="page-header">
                <h2>Users</h2>
            </div>

            <Input placeholder="Search by name, email or role..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />

            {loading ? (
                <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead><TableHead>Email</TableHead>
                            <TableHead>Role</TableHead><TableHead>Job Title</TableHead>
                            <TableHead>Last Login</TableHead><TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 && (
                            <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No users found.</TableCell></TableRow>
                        )}
                        {filtered.map(u => (
                            <TableRow key={u._id}>
                                <TableCell>{u.firstName} {u.lastName}</TableCell>
                                <TableCell>{u.email}</TableCell>
                                <TableCell><Badge variant={ROLE_VARIANT[u.role] ?? 'outline'}>{u.role}</Badge></TableCell>
                                <TableCell>{u.jobTitle || '—'}</TableCell>
                                <TableCell>{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '—'}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="sm" onClick={() => toggleActive(u._id, u.isActive)}>
                                        <Badge variant={u.isActive ? 'default' : 'secondary'}>
                                            {u.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}