import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function Landing() {
    return (
        <div className="auth-page">
            <div className="auth-panel">
                <div className="auth-branding">
                    <div className="auth-branding-inner">
                        <div className="auth-logo-box">IT</div>
                        <h1 className="auth-brand-title">IT Support Portal</h1>
                        <p className="auth-brand-sub">Submit a support ticket or sign in to manage IT resources.</p>
                        <ul className="auth-feature-list">
                            <li>🎫 Submit support tickets</li>
                            <li>📦 Track asset inventory</li>
                            <li>📋 Manage projects & tasks</li>
                            <li>📚 Browse knowledge base</li>
                        </ul>
                    </div>
                </div>
                <div className="auth-form-panel">
                    <div className="auth-form">
                        <div className="auth-form-header">
                            <h2>Welcome</h2>
                            <p className="auth-form-desc">How can we help you today?</p>
                        </div>
                        <Link to="/submit-ticket">
                            <Button className="auth-submit-btn landing-btn">🎫 Submit a Support Ticket</Button>
                        </Link>
                        <div className="landing-divider">
                            <span>or</span>
                        </div>
                        <Link to="/login">
                            <Button variant="outline" className="landing-btn">Staff Login →</Button>
                        </Link>
                        <p className="auth-form-desc" style={{ textAlign: 'center' }}>
                            Need help? Contact <a href="mailto:it.assist@3ehitech.com" className="landing-link">IT Support</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}