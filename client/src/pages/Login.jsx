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
            <div className="auth-panel">
                <div className="auth-branding">
                    <div className="auth-branding-inner">
                        <div className="auth-logo">⚙️</div>
                        <h1 className="auth-brand-title">IT Productivity System</h1>
                        <p className="auth-brand-sub">Manage assets, tickets, projects and your team - all in one place.</p>
                    </div>
                </div>
                <div className="auth-form-panel">
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-form-header">
                            <h2>Welcome back.</h2>
                            <p className="auth-form-desc">Sign in to your account to continue.</p>
                        </div>
                        {error && <p className="error">{error}</p>}
                        <div className="auth-field">
                            <label>Email</label>
                            <Input type="email" placeholder="you@company.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                        </div>
                        <div className="auth-field">
                            <label>Password</label>
                            <Input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign in'}
                        </Button>
                        <p className="auth-switch">No account? <Link to="/register">Create one</Link></p>
                    </form>
                </div>
            </div>
        </div>
    )
}