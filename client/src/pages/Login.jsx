import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        const data = await login(form).finally(() => setLoading(false))
        if (data.user) navigate('/')
        else setError(data.message || 'Login failed.')
    }

    return (
        <div className="auth-page">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Login</h2>
                {error && <p className="error">{error}</p>}
                <Input type="email" placeholder="Email" value={form.email}onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                <Input type="password" placeholder="Password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                <Button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</Button>
                <p>No account? <Link to="/register">Register</Link></p>
            </form>
        </div>
    )
}