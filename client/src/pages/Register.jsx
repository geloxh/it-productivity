import { useState } from 'react'
import { authApi } from '../api/auth'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        try {
            const data = await authApi.register(form)
            if (data.user) navigate('/login')
            else setError(data.error?.message || data.message || 'Registration failed.')
        } catch {
            setError('Registration failed.')
        }
    }

    return (
        <div className="auth-page">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Register</h2>
                {error && <p className="error">{error}</p>}
                <input type="text" placeholder="First Name" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required />
                <input type="text" placeholder="Last Name" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required />
                <input type="email" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                <input type="password" placeholder="Password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required/>
                <button type="submit">Register</button>
                <p>Have an account? <Link to="/login">Login</Link></p>
            </form>
        </div>
    )
}