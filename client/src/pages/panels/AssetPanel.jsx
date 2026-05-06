import { useState } from 'react'
import { api } from '../../api/index'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

const CATEGORIES = ['Laptop', 'Desktop', 'Server', 'Network', 'Peripheral', 'Software', 'Mobile']
const EQUIPMENT_STATUSES = ['Good', 'Defective', 'For Repair', 'For Disposal']
const CONTRACT_STATUSES = ['Active', 'Expired', 'None']
const FIELDS = [
    { key: 'assetTag', label: 'Asset Tag', required: true },
    { key: 'name', label: 'Name / Label', required: true },
    { key: 'user', label: 'User' }, { key: 'formerUser', label: 'Former User' },
    { key: 'serialNumber', label: 'Serial No.' }, { key: 'manufacturer', label: 'Brand' },
    { key: 'model', label: 'Model' }, { key: 'deviceYearModel', label: 'Year Model' },
    { key: 'systemInfo', label: 'System Info' }, { key: 'company', label: 'Company' },
    { key: 'notes', label: 'Notes' },
]
const EMPTY = {
    name: '', assetTag: '', category: 'Laptop', serialNumber: '', manufacturer: '',
    model: '', deviceYearModel: '', systemInfo: '', user: '', formerUser: '',
    company: '', contractStatus: 'None', equipmentStatus: 'Good', dateAcquired: '', notes: ''
}

export default function AssetPanel() {
    const [form, setForm] = useState(EMPTY)
    const [saving, setSaving] = useState(false)

    const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))
    const setVal = (key) => (v) => setForm(f => ({ ...f, [key]: v }))

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true)
        try {
            const res = await api.post('/assets', form)
            if (res.error) return toast.error(res.error)
            localStorage.setItem('panel:reload', 'assets')
            window.close()
        } catch (err) {
            toast.error(err.message)
        } finally { setSaving(false) }
    }

    return (
        <div style={{ padding: '24px', maxWidth: 640, margin: '0 auto' }}>
            <h2 style={{ marginBottom: 16 }}>Add Asset</h2>
            <form onSubmit={handleSubmit} className="assets-form">
                {FIELDS.map(({ key, label, required }) => (
                    <div key={key} className="assets-field">
                        <label>{label}{required && ' *'}</label>
                        <Input value={form[key]} onChange={set(key)} required={required} />
                    </div>
                ))}
                <div className="assets-field"><label>Category</label>
                    <Select value={form.category} onValueChange={setVal('category')}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="assets-field"><label>Contract Status</label>
                    <Select value={form.contractStatus} onValueChange={setVal('contractStatus')}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{CONTRACT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="assets-field"><label>Equipment Status</label>
                    <Select value={form.equipmentStatus} onValueChange={setVal('equipmentStatus')}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{EQUIPMENT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="assets-field"><label>Date Acquired</label>
                    <Input type="date" value={form.dateAcquired} onChange={set('dateAcquired')} />
                </div>
                <div className="assets-form-footer">
                    <Button type="button" variant="outline" onClick={() => window.close()}>Cancel</Button>
                    <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Asset'}</Button>
                </div>
            </form>
        </div>
    )
}
