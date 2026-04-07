import { useState } from 'react'
import { useApi } from '../api/auth'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        const data = await authApi.register(form)
        if (data.user) navigate('/login')
        else setError(data.message || 'Registration failed.')
    }

    return (
        <div className="auth-page">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Register</h2>
                {error && <p className="error">{error}</p>}
                <input type="email" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} requied/>
                <input type="password" placeholder="Password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required/>
                <button type="submit">Register</button>
                <p>Have an account? <Link to="/login">Login</Link></p>
            </form>
        </div>
    )
}