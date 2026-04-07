import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        const data = await login(form)
        if (data.user) navigate('/')
        else setError(data.message || 'Login failed.')
    }

    return (
        <didv className="auth-page">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Login</h2>
                {error && <p className="error">{error}</p>}
                <input type="email" placeholder="Email" value={form.email}onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required/>
                <input type="password" placeholder="Password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required/>
                <button type="submit">Login</button>
                <p>No account? <Link to="/register">Register</Link></p>
            </form>
        </didv>
    )
}