import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff } from 'lucide-react'

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ identifier: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPass, setShowPass] = useState(false)

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
            <div className="auth-window">
                <div className="auth-titlebar">
                    <span className="auth-titlebar-icon">⚙</span>
                    <span className="auth-titlebar-text">IT Productivity — Authentication</span>
                    <div className="auth-titlebar-controls">
                        <span />
                        <span />
                        <span />
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
                                <h2>Sign In</h2>
                                <p className="auth-form-desc">Enter your credentials to access the system</p>
                            </div>
                            {error && <p className="error">{error}</p>}
                            <div className="auth-field">
                                <label>Email or Username</label>
                                <Input type="text" placeholder="user@company.com or username" value={form.identifier} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                            </div>
                            <div className="auth-field">
                                <label>Password</label>
                                <div className="auth-pass-wrap">
                                    <Input
                                        type={showPass ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                        required
                                    />
                                    <button type="button" className="auth-show-pass" onClick={() => setShowPass(v => !v)}>
                                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>
                            <Button type="submit" className="w-full auth-submit-btn" disabled={loading}>
                                {loading ? 'Authenticating...' : 'Sign In'}
                            </Button>
                            <p className="auth-switch">No account? <Link to="/register">Register</Link></p>
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