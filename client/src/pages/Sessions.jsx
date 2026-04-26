import { useCallback } from 'react'
import { api } from '../api/index'
import { useData } from '../hooks/useData'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export default function Sessions() {
    const fetcher = useCallback(() => api.get('/sessions').then(d => d.sessions ?? d), [])
    const { data: sessions, loading, reload } = useData(fetcher)

    const logoutAll = async () => {
        await api.post('/sessions/logout-all')
        toast.success('Logged out of all devices.')
        reload()
    }

    const logoutOthers = async () => {
        await api.post('/sessions/logout-others')
        toast.success('Logged out of other devices.')
        reload()
    }

    return (
        <div className="space-y-4">
            <h2>Active Sessions</h2>
            <div className="flex gap-2">
                <Button variant="outline" onClick={logoutOthers}>Logout Other Devices</Button>
                <Button variant="destructive" onClick={logoutAll}>Logout All Devices</Button>
            </div>
            {loading ? (
                <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow><TableHead>IP Address</TableHead><TableHead>User Agent</TableHead><TableHead>Expires</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                        {sessions.map(s => (
                            <TableRow key={s._id}>
                                <TableCell>{s.ipAddress}</TableCell>
                                <TableCell className="max-w-xs truncate">{s.userAgent}</TableCell>
                                <TableCell>{new Date(s.expiresAt).toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}