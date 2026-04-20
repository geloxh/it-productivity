import { useCallback } from 'react'
import { api } from '../api/index'
import { useData } from '../hooks/useData'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export default function Users() {
    const fetcher = useCallback(() => api.get('/users').then(d => { 
      const result = d.users ?? d 
      return Array.isArray(result) ? result : []
    }), [])
    const { data: users, loading } = useData(fetcher)

    return (
        <div className="space-y-4">
            <h2>Users</h2>
            {loading ? (
                <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map(u => (
                            <TableRow key={u._id}>
                                <TableCell>{u.firstName} {u.lastName}</TableCell>
                                <TableCell>{u.email}</TableCell>
                                <TableCell><Badge variant="outline">{u.role}</Badge></TableCell>
                                <TableCell><Badge variant={u.isActive ? 'default' : 'secondary'}>{u.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}