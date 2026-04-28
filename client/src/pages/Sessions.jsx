import { useCallback } from 'react'
import { api } from '../api/index'
import { useData } from '../hooks/useData'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export default function Sessions() {
    const fetcher = useCallback(() => api.get('/sessions').then(d => d.sessions ?? d), [])
    const { data: sessions = [], loading, reload } = useData(fetcher)

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
        <div className="assets-root">
            <div className="dash-toolbar">
                <span className="dash-title">Active Sessions</span>
                <div className="dash-toolbar-right">
                    <Button size="sm" variant="outline" onClick={logoutOthers}>Logout Other Devices</Button>
                    <Button size="sm" variant="destructive" onClick={logoutAll}>Logout All Devices</Button>
                </div>
            </div>

            <div className="assets-grid">
                {loading ? (
                    <div className="p-4 space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>IP Address</TableHead>
                                <TableHead>User Agent</TableHead>
                                <TableHead>Expires</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sessions.length === 0 && (
                                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-10">No active sessions.</TableCell></TableRow>
                            )}
                            {sessions.map(s => (
                                <TableRow key={s._id}>
                                    <TableCell><code>{s.ipAddress}</code></TableCell>
                                    <TableCell className="max-w-xs truncate">{s.userAgent}</TableCell>
                                    <TableCell>{new Date(s.expiresAt).toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            <div className="dash-statusbar">
                <span>{sessions.length} active session{sessions.length !== 1 ? 's' : ''}</span>
                <span>Session Management</span>
            </div>
        </div>
    )
}
