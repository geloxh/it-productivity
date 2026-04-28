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
            const res = await api.patch(`/users/${id}`, {
                                isActive: !current })
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
        <div className="assets-root">
            <div className="dash-toolbar">
                <span className="dash-title">Users</span>
                <div className="dash-toolbar-right">
                    <Input placeholder="Search by name, email or role..." value={search} onChange={e => setSearch(e.target.value)} className="assets-search" />
                </div>
            </div>

            <div className="assets-grid">
                {loading ? (
                    <div className="p-4 space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
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
                                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">No users found.</TableCell></TableRow>
                            )}
                            {filtered.map(u => (
                                <TableRow key={u._id}>
                                    <TableCell className="font-medium">{u.firstName} {u.lastName}</TableCell>
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

            <div className="dash-statusbar">
                <span>{filtered.length} user{filtered.length !== 1 ? 's' : ''}{search ? ' (filtered)' : ''}</span>
                <span>{users.filter(u => u.isActive).length} active · {users.filter(u => !u.isActive).length} inactive</span>
            </div>
        </div>
    )
}

