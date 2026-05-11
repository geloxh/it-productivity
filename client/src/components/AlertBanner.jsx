import { useState } from 'react'
import { useAlerts } from '../context/AlertContext'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/index'

const SEV_LABEL = { P1: 'CRITICAL', P2: 'HIGH', P3: 'MEDIUM', P4: 'LOW' }

/**
 * P1 persistent top banner — one banner per unacknowledged P1 alert.
 * Stacks if multiple P1s exist. Each dismisses independently.
 */
export default function AlertBanner() {
    const { p1Alerts, acknowledge } = useAlerts()
    const navigate = useNavigate()
    const [creatingTicket, setCreatingTicket] = useState(null)

    if (!p1Alerts.length) return null

    const handleCreateTicket = async (alert) => {
        setCreatingTicket(alert._id)
        try {
            await api.post('/tickets', {
                title: `[ALERT] ${alert.title}`,
                description: alert.message + (alert.assetName ? `\n\nAsset: ${alert.assetName}` : ''),
                priority: 'Critical',
                category: alert.category === 'Hardware' ? 'Hardware'
                    : alert.category === 'Network' ? 'Network'
                    : alert.category === 'Software' ? 'Software'
                    : 'Other',
            })
            await acknowledge(alert._id)
            navigate('/tickets')
        } catch {
            // ignore
        } finally {
            setCreatingTicket(null)
        }
    }

    return (
        <div className="alert-banner-stack">
            {p1Alerts.map(alert => (
                <div key={alert._id} className="alert-banner alert-banner-p1">
                    <div className="alert-banner-left">
                        <span className="alert-banner-sev">P1</span>
                        <span className="alert-banner-icon">🚨</span>
                        <div className="alert-banner-body">
                            <span className="alert-banner-title">{alert.title}</span>
                            {alert.count > 1 && (
                                <span className="alert-banner-count">fired {alert.count}×</span>
                            )}
                            <span className="alert-banner-msg">{alert.message}</span>
                            {alert.assetName && (
                                <span className="alert-banner-asset">Asset: {alert.assetName}</span>
                            )}
                        </div>
                    </div>
                    <div className="alert-banner-actions">
                        <button
                            className="alert-banner-btn alert-banner-btn-ticket"
                            onClick={() => handleCreateTicket(alert)}
                            disabled={creatingTicket === alert._id}
                        >
                            {creatingTicket === alert._id ? 'Creating...' : '+ Create Ticket'}
                        </button>
                        <button
                            className="alert-banner-btn alert-banner-btn-ack"
                            onClick={() => acknowledge(alert._id)}
                        >
                            Acknowledge
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}
