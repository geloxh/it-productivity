import { useState, useRef, useEffect } from 'react'
import { useAlerts } from '../context/AlertContext'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/index'

const SEV_COLOR = {
    P1: { bg: '#fef2f2', border: '#fecaca', color: '#dc2626', dot: '#dc2626' },
    P2: { bg: '#fff7ed', border: '#fed7aa', color: '#ea580c', dot: '#ea580c' },
    P3: { bg: '#fefce8', border: '#fde68a', color: '#ca8a04', dot: '#ca8a04' },
    P4: { bg: '#f0f9ff', border: '#bae6fd', color: '#0369a1', dot: '#0369a1' },
}

function AlertRow({ alert, onAck, onResolve, onCreateTicket, creating }) {
    const [expanded, setExpanded] = useState(false)
    const s = SEV_COLOR[alert.severity] ?? SEV_COLOR.P4

    return (
        <div className="notif-alert-row" style={{ borderLeft: `3px solid ${s.border}`, background: s.bg }}>
            <div className="notif-alert-header" onClick={() => setExpanded(e => !e)}>
                <span className="notif-alert-sev" style={{ color: s.color }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot, display: 'inline-block', marginRight: 5 }} />
                    {alert.severity}
                </span>
                <span className="notif-alert-title">{alert.title}</span>
                {alert.count > 1 && (
                    <span className="notif-alert-count" style={{ color: s.color }}>×{alert.count}</span>
                )}
                <span className="notif-alert-chevron">{expanded ? '▲' : '▼'}</span>
            </div>
            {expanded && (
                <div className="notif-alert-detail">
                    <p className="notif-alert-msg">{alert.message}</p>
                    {alert.assetName && (
                        <p className="notif-alert-asset">Asset: {alert.assetName}</p>
                    )}
                    <div className="notif-alert-actions">
                        <button
                            className="notif-btn notif-btn-ticket"
                            onClick={() => onCreateTicket(alert)}
                            disabled={creating}
                        >
                            {creating ? 'Creating...' : '+ Ticket'}
                        </button>
                        <button className="notif-btn notif-btn-ack" onClick={() => onAck(alert._id)}>
                            Acknowledge
                        </button>
                        <button className="notif-btn notif-btn-resolve" onClick={() => onResolve(alert._id)}>
                            Resolve
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function NotificationPanel({ open, onClose }) {
    const { p2Alerts, p3Count, p4Count, bellCount, acknowledge, acknowledgeAll, resolve } = useAlerts()
    const navigate = useNavigate()
    const panelRef = useRef(null)
    const [creatingTicket, setCreatingTicket] = useState(null)

    // Close on outside click
    useEffect(() => {
        if (!open) return
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) onClose()
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open, onClose])

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
            await acknowledge(alert._id)
            onClose()
            navigate('/tickets')
        } catch { /* ignore */ }
        finally { setCreatingTicket(null) }
    }

    if (!open) return null

    return (
        <div className="notif-panel" ref={panelRef}>
            <div className="notif-panel-header">
                <span className="notif-panel-title">Notifications</span>
                {bellCount > 0 && (
                    <button className="notif-ack-all-btn" onClick={acknowledgeAll}>
                        Acknowledge all
                    </button>
                )}
                <button className="notif-close-btn" onClick={onClose}>✕</button>
            </div>

            <div className="notif-panel-body">
                {bellCount === 0 && (
                    <div className="notif-empty">
                        <span style={{ fontSize: 24 }}>🔔</span>
                        <span>No unacknowledged alerts</span>
                    </div>
                )}

                {p2Alerts.length > 0 && (
                    <div className="notif-section">
                        <div className="notif-section-label">P2 — High Priority</div>
                        {p2Alerts.map(a => (
                            <AlertRow
                                key={a._id}
                                alert={a}
                                onAck={acknowledge}
                                onResolve={resolve}
                                onCreateTicket={handleCreateTicket}
                                creating={creatingTicket === a._id}
                            />
                        ))}
                    </div>
                )}

                {(p3Count > 0 || p4Count > 0) && (
                    <div className="notif-section">
                        <div className="notif-section-label">Lower Priority</div>
                        {p3Count > 0 && (
                            <div className="notif-count-row" style={{ color: SEV_COLOR.P3.color }}>
                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: SEV_COLOR.P3.dot, display: 'inline-block' }} />
                                P3 — {p3Count} alert{p3Count !== 1 ? 's' : ''}
                            </div>
                        )}
                        {p4Count > 0 && (
                            <div className="notif-count-row" style={{ color: SEV_COLOR.P4.color }}>
                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: SEV_COLOR.P4.dot, display: 'inline-block' }} />
                                P4 — {p4Count} alert{p4Count !== 1 ? 's' : ''}
                            </div>
                        )}
                        <button
                            className="notif-view-all-btn"
                            onClick={() => { onClose(); navigate('/alerts') }}
                        >
                            View all in Alert History →
                        </button>
                    </div>
                )}
            </div>

            <div className="notif-panel-footer">
                <button className="notif-view-all-btn" onClick={() => { onClose(); navigate('/alerts') }}>
                    Open Alert History
                </button>
            </div>
        </div>
    )
}
