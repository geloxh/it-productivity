import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function Landing() {
    return (
        <div className="auth-page">
            <div className="auth-panel">
                <div className="auth-branding">
                    <div className="auth-branding-inner">
                        <div className="auth-logo">⚙️</div>
                        <h1 className="auth-brand-title">IT Support Portal</h1>
                        <p className="auth-brand-sub">Submit a support ticket or sign in to manage IT resources.</p>
                    </div>
                </div>
                <div className="auth-form-panel">
                    <div className="auth-form">
                        <div className="auth-form-header">
                            <h2>Welcome</h2>
                            <p className="auth-form-desc">How can we help you today?</p>
                        </div>
                        <Link to="/submit-ticket">
                            <Button className="w-full">Submit a Support Ticket</Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="outline" className="w-full">Staff Login</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}