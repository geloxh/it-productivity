import { useEffect, useState } from 'react'
import { api } from '../api/index'

export default function Users() {
  const [users, setUsers]   = useState([])
  const [error, setError]   = useState(null)

  useEffect(() => {
    api.get('/users').then(d => setUsers(d.users ?? d)).catch(() => setError('Failed to load users.'))
  }, [])

  if (error) return <p className="error">{error}</p>

  return (
    <div>
      <h2>Users</h2>
      <table className="data-table">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.firstName} {u.lastName}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.isActive ? 'Active' : 'Inactive'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}