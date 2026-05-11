import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { api } from '../api/index'
import { useAuth } from './AuthContext'

const AlertContext = createContext(null)

const POLL_INTERVAL = 30_000 // 30 seconds

export function AlertProvider({ children }) {
    const { user } = useAuth()
    const [p1Alerts, setP1Alerts]   = useState([])
    const [p2Alerts, setP2Alerts]   = useState([])
    const [p3Count, setP3Count]     = useState(0)
    const [p4Count, setP4Count]     = useState(0)
    const [panelOpen, setPanelOpen] = useState(false)
    const intervalRef = useRef(null)

    const bellCount = p1Alerts.length + p2Alerts.length + p3Count + p4Count

    const fetchUnacknowledged = useCallback(async () => {
        if (!user) return
        try {
            const data = await api.get('/alerts/unacknowledged')
            setP1Alerts(data.P1 ?? [])
            setP2Alerts(data.P2 ?? [])
            setP3Count(data.P3count ?? 0)
            setP4Count(data.P4count ?? 0)
        } catch {
            // silently fail — don't disrupt the app if alerts are unavailable
        }
    }, [user])

    useEffect(() => {
        if (!user) return
        fetchUnacknowledged()
        intervalRef.current = setInterval(fetchUnacknowledged, POLL_INTERVAL)
        return () => clearInterval(intervalRef.current)
    }, [user, fetchUnacknowledged])

    const acknowledge = useCallback(async (id) => {
        try {
            await api.post(`/alerts/${id}/acknowledge`, {})
            await fetchUnacknowledged()
        } catch { /* ignore */ }
    }, [fetchUnacknowledged])

    const acknowledgeAll = useCallback(async () => {
        try {
            await api.post('/alerts/acknowledge-all', {})
            await fetchUnacknowledged()
        } catch { /* ignore */ }
    }, [fetchUnacknowledged])

    const resolve = useCallback(async (id) => {
        try {
            await api.post(`/alerts/${id}/resolve`, {})
            await fetchUnacknowledged()
        } catch { /* ignore */ }
    }, [fetchUnacknowledged])

    return (
        <AlertContext.Provider value={{
            p1Alerts, p2Alerts, p3Count, p4Count,
            bellCount, panelOpen, setPanelOpen,
            acknowledge, acknowledgeAll, resolve,
            refresh: fetchUnacknowledged,
        }}>
            {children}
        </AlertContext.Provider>
    )
}

export const useAlerts = () => useContext(AlertContext)
