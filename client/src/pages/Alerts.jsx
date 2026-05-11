import { useState, useCallback } from 'react'
import { api } from '../api/index'
import { useData } from '../hooks/useData'
import { useAlerts } from '../context/AlertContext'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

const SEVERITIES = ['P1', 'P2', 'P3', 'P4']
const CATEGORIES = ['Hardware', 'Software', 'Network', 'Security', 'Performance', 'Other']

const SEV_STYLE = {
    P1: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
    P2: { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
    P3: { bg: '#fefce8', color: '#ca8a04', border: '#fde68a' },
    P4: { bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd' },
}

function SevBadge({ severity }) {
    const s = SEV_STYLE[severity] ?? SEV_STYLE.P4
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 7px', borderRadius: 999, fontSize: 11,
            fontFamily: 'var(--mono)', fontWeight: 600,
            background: s.bg, color: s.color, border: `1px solid ${s.border}`,
        }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            {severity}
        </span>
    )
}

export default function AlertsPage() {
    const navigate = useNavigate()
    const { acknowledge, resolve, refresh } = useAlerts()

    const [search, setSearch]               = useState('')
    const [filterSev, setFilterSev]         = useState('all')
    const [filterCat, setFilterCat]         = useState('all')
    const [filterResolved, setFilterResolved] = useState('false')
    const [fromDate, setFromDate]           = useState('')
    const [toDate, setToDate]               = useState('')
    const [expandedId, setExpandedId]       = useState(null)
    const [creatingTicket, setCreatingTicket] = useState(null)

    const buildQuery = useCallback(() => {
        const params = new URLSearchParams()
        if (filterSev !== 'all') params.set('severity', filterSev)
        if (filterCat !== 'all') params.set('category', filterCat)
        if (filterResolved !== 'all') params.set('resolved', filterResolved)
        if (fromDate) params.set('from', new Date(fromDate).toISOString())
        if (toDate) params.set('to', new Date(toDate + 'T23:59:59').toISOString())
        if (search) params.set('search', search)
        const qs = params.toString()
        return `/alerts${qs ? '?' + qs : ''}`
    }, [filterSev, filterCat, filterResolved, fromDate, toDate, search])

    const fetcher = useCallback(() => api.get(buildQuery()), [buildQuery])
    const { data: alerts = [], loading, reload } = useData(fetcher)

    const hasFilters = search || filterSev !== 'all' || filterCat !== 'all' || filterResolved !== 'false' || fromDate || toDate

    const handleAck = async (id) => {
        await acknowledge(id)
        reload()
        refresh()
    }

    const handleResolve = async (id) => {
        await resolve(id)
        reload()
        refresh()
    }

    const handleCreateTicket = async (alert) => {
        setCreatingTicket(alert._id)
        try {
            await api.post('/tickets', {
                title: `[ALERT] ${alert.title}`,
                description: alert.message + (alert.assetName ? `\n\nAsset: ${alert.assetName}` : ''),
                priority: alert.severity === 'P1' ? 'Critical'
                    : alert.severity === 'P2' ? 'High'
                    : alert.severity === 'P3' ? 'Medium' : 'Low',
                category: alert.category === 'Hardware' ? 'Hardware'
                    : alert.category === 'Network' ? 'Network'
                    : alert.category === 'Software' ? 'Software'
                    : 'Other',
            })
            toast.success('Ticket created from alert.')
            await handleAck(alert._id)
            navigate('/tickets')
        } catch (err) {
            toast.error(err.message)
        } finally {
            setCreatingTicket(null)
        }
    }

    const resetFilters = () => {
        setSearch(''); setFilterSev('all'); setFilterCat('all')
        setFilterResolved('false'); setFromDate(''); setToDate('')
    }

    return (
        <div className="assets-root">
            <div className="dash-toolbar">
                <span className="dash-title">Alert History</span>
                <div className="dash-toolbar-right">
                    <Input
                        placeholder="Search alerts..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="assets-search"
                    />
                    <Select value={filterSev} onValueChange={setFilterSev}>
                        <SelectTrigger className="filter-select"><SelectValue placeholder="Severity" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Severities</SelectItem>
                            {SEVERITIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={filterCat} onValueChange={setFilterCat}>
                        <SelectTrigger className="filter-select"><SelectValue placeholder="Category" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={filterResolved} onValueChange={setFilterResolved}>
                        <SelectTrigger className="filter-select"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="false">Active</SelectItem>
                            <SelectItem value="true">Resolved</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                        className="filter-date" title="From date" style={{ width: 130 }} />
                    <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                        className="filter-date" title="To date" style={{ width: 130 }} />
                    {hasFilters && (
                        <Button size="sm" variant="ghost" onClick={resetFilters}>✕ Clear</Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => navigate('/alerts/preferences')}>
                        ⚙ Preferences
                    </Button>
                </div>
            </div>

            <div className="assets-grid">
                {loading ? (
                    <div className="page-skeleton">{[...Array(6)].map((_, i) => <Skeleton key={i} />)}</div>
                ) : (
                    <Table>
                        <TableHeader className="assets-sticky-header">
                            <TableRow>
                                <TableHead style={{ width: 70 }}>Severity</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Asset</TableHead>
                                <TableHead>Fired</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {alerts.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="table-empty">No alerts found.</TableCell>
                                </TableRow>
                            )}
                            {alerts.map(alert => (
                                <>
                                    <TableRow
                                        key={alert._id}
                                        className={alert.isResolved ? 'task-row-done' : ''}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setExpandedId(expandedId === alert._id ? null : alert._id)}
                                    >
                                        <TableCell><SevBadge severity={alert.severity} /></TableCell>
                                        <TableCell className="table-cell-title">
                                            {alert.title}
                                            {alert.count > 1 && (
                                                <span className="task-overdue-tag" style={{ background: '#f0f9ff', color: '#0369a1', borderColor: '#bae6fd' }}>
                                                    ×{alert.count}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{alert.category}</TableCell>
                                        <TableCell style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>
                                            {alert.assetName || (alert.asset?.name) || '—'}
                                        </TableCell>
                                        <TableCell style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>
                                            {alert.count}×
                                        </TableCell>
                                        <TableCell>
                                            {alert.isResolved ? (
                                                <span style={{ color: '#16a34a', fontFamily: 'var(--mono)', fontSize: 11 }}>✓ Resolved</span>
                                            ) : (
                                                <span style={{ color: '#dc2626', fontFamily: 'var(--mono)', fontSize: 11 }}>● Active</span>
                                            )}
                                        </TableCell>
                                        <TableCell style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted-foreground)' }}>
                                            {new Date(alert.createdAt).toLocaleString()}
                                        </TableCell>
                                        <TableCell onClick={e => e.stopPropagation()}>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                {!alert.isResolved && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            style={{ fontSize: 11, height: 26, padding: '0 8px' }}
                                                            onClick={() => handleCreateTicket(alert)}
                                                            disabled={creatingTicket === alert._id}
                                                        >
                                                            {creatingTicket === alert._id ? '...' : '+ Ticket'}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            style={{ fontSize: 11, height: 26, padding: '0 8px' }}
                                                            onClick={() => handleAck(alert._id)}
                                                        >
                                                            Ack
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            style={{ fontSize: 11, height: 26, padding: '0 8px', color: '#16a34a', borderColor: '#bbf7d0' }}
                                                            onClick={() => handleResolve(alert._id)}
                                                        >
                                                            Resolve
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    {expandedId === alert._id && (
                                        <TableRow key={`${alert._id}-detail`}>
                                            <TableCell colSpan={8} style={{ background: '#f8fafc', padding: '10px 20px' }}>
                                                <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: '#0369a1', lineHeight: 1.6 }}>
                                                    <strong>Message:</strong> {alert.message}
                                                    {alert.source && <><br /><strong>Source:</strong> {alert.source}</>}
                                                    {alert.resolvedAt && <><br /><strong>Resolved at:</strong> {new Date(alert.resolvedAt).toLocaleString()}</>}
                                                    {alert.acknowledgedBy?.length > 0 && (
                                                        <><br /><strong>Acknowledged by:</strong> {alert.acknowledgedBy.length} user{alert.acknowledgedBy.length !== 1 ? 's' : ''}</>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            <div className="dash-statusbar">
                <span>{alerts.length} alert{alerts.length !== 1 ? 's' : ''}{hasFilters ? ' (filtered)' : ''}</span>
                <span>
                    {alerts.filter(a => !a.isResolved).length} active ·{' '}
                    {alerts.filter(a => a.isResolved).length} resolved
                </span>
            </div>
        </div>
    )
}
