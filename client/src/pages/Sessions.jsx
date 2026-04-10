import { useEffect, useState } from 'react'
import { api } from '../api/index'

export default function Sessions() {
  const [sessions, setSessions] = useState([])
  const [error, setError]       = useState(null)

  const load = () => api.get('/sessions').then(d => setSessions(d.sessions ?? d)).catch(() => setError('Failed to load sessions.'))

  useEffect(() => { load() }, [])

  const logoutAll    = async () => { await api.post('/sessions/logout-all');    load() }
  const logoutOthers = async () => { await api.post('/sessions/logout-others'); load() }

  if (error) return <p className="error">{error}</p>

  return (
    <div>
      <h2>Active Sessions</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={logoutOthers}>Logout Other Devices</button>
        <button className="btn-danger" onClick={logoutAll}>Logout All Devices</button>
      </div>
      <table className="data-table">
        <thead><tr><th>IP Address</th><th>User Agent</th><th>Expires</th></tr></thead>
        <tbody>
          {sessions.map(s => (
            <tr key={s._id}>
              <td>{s.ipAddress}</td>
              <td>{s.userAgent}</td>
              <td>{new Date(s.expiresAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}