import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/index'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

const CATEGORIES = ['All', 'Hardware', 'Software', 'Network', 'Security', 'Performance', 'Other']
const SEVERITIES = ['All', 'P1', 'P2', 'P3', 'P4']

const DEFAULT_PREFS = CATEGORIES.map(cat => ({
    alertCategory: cat,
    severity: 'All',
    inApp: true,
    email: false,
}))

export default function AlertPreferences() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const isAdmin = user?.role === 'SysAdmin' || user?.role === 'Admin'

    const [prefs, setPrefs]           = useState(DEFAULT_PREFS)
    const [orgPrefs, setOrgPrefs]     = useState(null)
    const [loading, setLoading]       = useState(true)
    const [saving, setSaving]         = useState(false)
    const [savingOrg, setSavingOrg]   = useState(false)
    const [tab, setTab]               = useState('personal') // 'personal' | 'org'

    useEffect(() => {
        api.get('/alerts/preferences')
            .then(data => {
                if (data.preferences?.preferences?.length) {
                    setPrefs(data.preferences.preferences)
                }
                if (data.orgDefaults?.preferences?.length) {
                    setOrgPrefs(data.orgDefaults.preferences)
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    const updatePref = (index, field, value) => {
        setPrefs(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p))
    }

    const updateOrgPref = (index, field, value) => {
        setOrgPrefs(prev => (prev ?? DEFAULT_PREFS).map((p, i) => i === index ? { ...p, [field]: value } : p))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await api.put('/alerts/preferences', { preferences: prefs })
            toast.success('Preferences saved.')
        } catch (err) {
            toast.error(err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleSaveOrg = async () => {
        setSavingOrg(true)
        try {
            await api.put('/alerts/preferences/org', { preferences: orgPrefs ?? DEFAULT_PREFS })
            toast.success('Org defaults saved.')
        } catch (err) {
            toast.error(err.message)
        } finally {
            setSavingOrg(false)
        }
    }

    const activePrefs = tab === 'personal' ? prefs : (orgPrefs ?? DEFAULT_PREFS)
    const updateFn = tab === 'personal' ? updatePref : updateOrgPref

    return (
        <div className="assets-root">
            <div className="dash-toolbar">
                <span className="dash-title">Notification Preferences</span>
                <div className="dash-toolbar-right">
                    <Button size="sm" variant="outline" onClick={() => navigate('/alerts')}>
                        ← Back to Alerts
                    </Button>
                </div>
            </div>

            <div style={{ padding: '20px 24px', maxWidth: 720 }}>
                {isAdmin && (
                    <div className="pref-tabs">
                        <button
                            className={`pref-tab${tab === 'personal' ? ' pref-tab-active' : ''}`}
                            onClick={() => setTab('personal')}
                        >
                            My Preferences
                        </button>
                        <button
                            className={`pref-tab${tab === 'org' ? ' pref-tab-active' : ''}`}
                            onClick={() => setTab('org')}
                        >
                            Org Defaults
                        </button>
                    </div>
                )}

                <p className="auth-form-desc" style={{ marginBottom: 16 }}>
                    {tab === 'personal'
                        ? 'Control how you receive alerts. These settings override org defaults.'
                        : 'Set default notification behavior for all users in the organization.'}
                </p>

                {loading ? (
                    <div className="page-skeleton">{[...Array(4)].map((_, i) => <Skeleton key={i} />)}</div>
                ) : (
                    <>
                        <div className="pref-table">
                            <div className="pref-table-header">
                                <span>Category</span>
                                <span>Min Severity</span>
                                <span style={{ textAlign: 'center' }}>In-App</span>
                                <span style={{ textAlign: 'center' }}>Email</span>
                            </div>
                            {activePrefs.map((pref, i) => (
                                <div key={pref.alertCategory} className="pref-table-row">
                                    <span className="pref-cat-label">{pref.alertCategory}</span>
                                    <select
                                        className="submit-select pref-select"
                                        value={pref.severity}
                                        onChange={e => updateFn(i, 'severity', e.target.value)}
                                    >
                                        {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <div style={{ textAlign: 'center' }}>
                                        <input
                                            type="checkbox"
                                            checked={pref.inApp}
                                            onChange={e => updateFn(i, 'inApp', e.target.checked)}
                                            className="bulk-checkbox"
                                        />
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <input
                                            type="checkbox"
                                            checked={pref.email}
                                            onChange={e => updateFn(i, 'email', e.target.checked)}
                                            className="bulk-checkbox"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                            {tab === 'personal' ? (
                                <Button size="sm" onClick={handleSave} disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Preferences'}
                                </Button>
                            ) : (
                                <Button size="sm" onClick={handleSaveOrg} disabled={savingOrg}>
                                    {savingOrg ? 'Saving...' : 'Save Org Defaults'}
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
