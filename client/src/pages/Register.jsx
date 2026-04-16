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
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Register</h2>
                {error && <p className="error">{error}</p>}
                <Input type="text" placeholder="First Name" value={form.firstName} onChange={set('firstName')} required />
                <Input type="text" placeholder="Last Name" value={form.lastName} onChange={set('lastName')} required />
                <Input type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
                <Input type="password" placeholder="Password" value={form.password} onChange={set('password')} required/>
                <Button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</Button>
                <p>Have an account? <Link to="/login">Login</Link></p>
            </form>
        </div>
    )
}