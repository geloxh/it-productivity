import { useState } from 'react'
import { authApi } from '../api/auth'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff } from 'lucide-react'

export default function Register() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ 
        firstName: '', 
        lastName: '', 
        email: '',
        username: '', 
        password: '',
        confirmPassword: '' 
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPass, setShowPass] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        setLoading(true)
        try {
            const data = await authApi.register(submitData)
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
            <div className="auth-window">
                <div className="auth-titlebar">
                    <span className="auth-titlebar-icon">⚙</span>
                    <span className="auth-titlebar-text">IT Productivity — New Account</span>
                    <div className="auth-titlebar-controls">
                        <span /><span /><span />
                    </div>
                </div>
                <div className="auth-panel">
                    <div className="auth-branding">
                        <div className="auth-branding-inner">
                            <div className="auth-logo-box">IT</div>
                            <h1 className="auth-brand-title">IT Productivity</h1>
                            <p className="auth-brand-sub">Assets · Tickets · Projects · Knowledge Base</p>
                            <ul className="auth-feature-list">
                                <li>▸ Asset Management</li>
                                <li>▸ Ticket System</li>
                                <li>▸ Project Tracking</li>
                                <li>▸ Audit Logging</li>
                            </ul>
                        </div>
                    </div>
                    <div className="auth-form-panel">
                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="auth-form-header">
                                <h2>Create Account</h2>
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
                                <label>Username</label>
                                <Input type="text" placeholder="johndoe" value={form.username} onChange={set('username')} required />
                            </div>
                            <div className="auth-field">
                                <label>Password</label>
                                <div className="auth-pass-wrap">
                                    <Input
                                        type={showPass ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={set('password')}
                                        required
                                    />
                                    <button type="button" className="auth-show-pass" onClick={() => setShowPass(v => !v)}>
                                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>
                            <div className="auth-field">
                                <label>Confirm Password</label>
                                <div className="auth-pass-wrap">
                                    <Input
                                        type={showPass ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={form.confirmPassword}
                                        onChange={set('confirmPassword')}
                                        required
                                    />
                                    <button type="button" className="auth-show-pass" onClick={() => setShowPass(v => !v)}>
                                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>
                            <Button type="submit" className="w-full auth-submit-btn" disabled={loading}>
                                {loading ? 'Creating account...' : 'Create Account'}
                            </Button>
                            <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
                        </form>
                    </div>
                </div>
                <div className="auth-statusbar">
                    <span>● System Online</span>
                    <span>v1.0.0</span>
                </div>
            </div>
        </div>
    )
}