import { useState } from 'react'
import { authApi } from '../api/auth'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Register() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const data = await authApi.register(form)
            if (data.user) navigate('/login')
            else setError(data.error?.message || data.message || 'Registration failed.')
        } catch {
            setError('Registration failed.')
        } finally {
            setLoading(false)
        }
    }

    const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

    return (
        <div className="auth-page">
            <div className="auth-panel">
                <div className="auth-branding">
                    <div className="auth-branding-inner">
                        <div className="auth-logo">⚙️</div>
                        <h1 className="auth-brand-title">IT Productivity</h1>
                        <p className="auth-brand-sub">Join your team and start managing IT resources efficiently.</p>
                    </div>
                </div>
                <div className="auth-form-panel">
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-form-header">
                            <h2>Create account</h2>
                            <p className="auth-form-desc">Fill in your details to get started</p>
                        </div>
                        {error && <p className="error">{error}</p>}
                        <div className="auth-row">
                            <div className="auth-field">
                                <label>First Name</label>
                                <Input type="text" placeholder="John" value={form.firstName} onChange={set('firstName')} required />
                            </div>
                            <div className="auth-field">
                                <label>Last Name</label>
                                <Input type="text" placeholder="Doe" value={form.lastName} onChange={set('lastName')} required />
                            </div>
                        </div>
                        <div className="auth-field">
                            <label>Email</label>
                            <Input type="email" placeholder="you@company.com" value={form.email} onChange={set('email')} required />
                        </div>
                        <div className="auth-field">
                            <label>Password</label>
                            <Input type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Creating account...' : 'Create account'}
                        </Button>
                        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
                    </form>
                </div>
            </div>
        </div>
    )
}