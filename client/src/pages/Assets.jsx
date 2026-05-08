import { useElectron } from '../context/ElectronContext'

import { useState, useCallback, useRef, useEffect } from 'react'
import { api } from '../api/index'
import { useData } from '../hooks/useData'
import { useAssetPrefs } from '../hooks/useAssetPrefs'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

const CATEGORIES = ['Laptop', 'Desktop', 'Server', 'Network', 'Peripheral', 'Software', 'Mobile']
const STATUSES = ['Available', 'Assigned', 'Maintenance', 'Retired', 'Lost']
const EQUIPMENT_STATUSES = ['Good', 'Defective', 'For Repair', 'For Disposal']
const CONTRACT_STATUSES = ['Active', 'Expired', 'None']

const STATUS_COLOR = {
  Available: 'badge-available', Assigned: 'badge-assigned',
  Maintenance: 'badge-maintenance', Retired: 'badge-retired', Lost: 'badge-lost',
}
const EQUIP_COLOR = {
  Good: 'badge-available', Fair: 'badge-maintenance',
  Poor: 'badge-lost', Scrap: 'badge-retired', Excellent: 'badge-assigned',
}
const COL_LABELS = {
  assetTag: 'Asset Tag', name: 'Name', user: 'User', category: 'Type',
  serialNumber: 'Serial No.', systemInfo: 'System Info', manufacturer: 'Brand',
  model: 'Model', deviceYearModel: 'Year', formerUser: 'Former User',
  contractStatus: 'Contract', dateAcquired: 'Acquired', equipmentStatus: 'Equip.',
  notes: 'Notes', company: 'Company', status: 'Status',
}
const EMPTY = {
  name: '', assetTag: '', category: 'Laptop', serialNumber: '', manufacturer: '',
  model: '', deviceYearModel: '', systemInfo: '', user: '', formerUser: '',
  company: '', contractStatus: 'None', equipmentStatus: 'Good', dateAcquired: '', notes: ''
}
const FIELDS = [
  { key: 'assetTag', label: 'Asset Tag', required: true },
  { key: 'name', label: 'Name / Label', required: true },
  { key: 'user', label: 'User' }, { key: 'formerUser', label: 'Former User' },
  { key: 'serialNumber', label: 'Serial No.' }, { key: 'manufacturer', label: 'Brand' },
  { key: 'model', label: 'Model' }, { key: 'deviceYearModel', label: 'Year Model' },
  { key: 'systemInfo', label: 'System Info' }, { key: 'company', label: 'Company' },
  { key: 'notes', label: 'Notes' },
]

function StatusBadge({ value, colorMap }) {
  return <span className={`asset-badge ${colorMap[value] ?? 'badge-retired'}`}>{value || '—'}</span>
}

function InlineCell({ value, onSave, type = 'text', options }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)
  const ref = useRef()
  const commit = () => { setEditing(false); if (val !== value) onSave(val) }
  if (editing) {
    if (options) return (
      <select autoFocus className="inline-cell-select" value={val}
        onChange={e => { setVal(e.target.value); setEditing(false); if (e.target.value !== value) onSave(e.target.value) }}
        onBlur={() => setEditing(false)}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    )
    return (
      <input ref={ref} autoFocus className="inline-cell-input" type={type} value={val}
        onChange={e => setVal(e.target.value)} onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }} />
    )
  }
  return (
    <span className="inline-cell-view" onClick={() => { setVal(value); setEditing(true) }}>
      {value || <span className="inline-cell-empty">—</span>}
    </span>
  )
}

function renderCell(col, a, onPatch) {
  const save = (v) => onPatch(a._id, { [col]: v })
  if (col === 'status') return <StatusBadge value={a.status} colorMap={STATUS_COLOR} />
  if (col === 'equipmentStatus') return <StatusBadge value={a.equipmentStatus} colorMap={EQUIP_COLOR} />
  if (col === 'contractStatus') return <InlineCell value={a.contractStatus} onSave={save} options={CONTRACT_STATUSES} />
  if (col === 'category') return <InlineCell value={a.category} onSave={save} options={CATEGORIES} />
  if (col === 'dateAcquired') return a.dateAcquired ? new Date(a.dateAcquired).toLocaleDateString() : '—'
  if (col === 'assetTag' || col === 'serialNumber') return <code>{a[col] || '—'}</code>
  return <InlineCell value={a[col] ?? ''} onSave={save} />
}

export default function Assets() {
  const { user } = useAuth()
  const fetcher = useCallback(() => api.get('/assets').then(d => d.assets ?? d), [])
  const { data: assets = [], loading, reload } = useData(fetcher)

  const { viewMode, setViewMode, colOrder, setColOrder, hiddenCols, toggleCol } = useAssetPrefs(user?._id)

  const { openPanel, isElectron } = useElectron()

  useEffect(() => {
    const handler = () => {
      if (localStorage.getItem('panel:reload') === 'assets') {
        localStorage.removeItem('panel:reload')
        reload()
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [reload])

  const handleAddClick = () => {
    if (isElectron && openPanel) {
      openPanel({ route: '/panel/assets/new', width: 860, height: 700, title: 'Add Asset' })  
    } else {
      setShowForm(true)
    }
  }

  const [form, setForm] = useState(EMPTY)
  const [showForm, setShowForm] = useState(false)
  const [showColMenu, setShowColMenu] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const dragCol = useRef(null)
  const importRef = useRef(null)

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))
  const setVal = (key) => (v) => setForm(f => ({ ...f, [key]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const res = await api.post('/assets', form)
      if (res.error) return toast.error(res.error)
      toast.success('Asset added.'); setForm(EMPTY); setShowForm(false); reload()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    const res = await api.delete(`/assets/${id}`)
    if (res.error) return toast.error(res.error)
    toast.success('Asset deleted.'); reload()
  }

  const handlePatch = async (id, patch) => {
    const res = await api.patch(`/assets/${id}`, patch)
    if (res.error) return toast.error(res.error)
    reload()
  }

  const filtered = assets.filter(a =>
    [a.name, a.assetTag, a.user, a.serialNumber].some(v =>
      v?.toLowerCase().includes(search.toLowerCase())
    )
  )

  const visibleCols = colOrder.filter(c => !hiddenCols.includes(c))
  const onDragStart = (col) => { dragCol.current = col }
  const onDrop = (col) => {
    if (!dragCol.current || dragCol.current === col) return
    const next = [...colOrder]
    const from = next.indexOf(dragCol.current), to = next.indexOf(col)
    next.splice(from, 1); next.splice(to, 0, dragCol.current)
    setColOrder(next); dragCol.current = null
  }

  const handleExport = () => {
    const cols = Object.keys(EMPTY)
    const rows = [cols.join(','), ...filtered.map(a => cols.map(k => JSON.stringify(a[k] ?? '')).join(','))]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    Object.assign(document.createElement('a'), { href: url, download: 'assets.csv' }).click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async (e) => {
    const file = e.target.files[0]; e.target.value = ''
    if (!file) return
    const text = await file.text()
    const [header, ...lines] = text.trim().split('\n')
    const keys = header.split(',')
    const records = lines.map(line => {
      const vals = line.match(/(\".*?\"|[^,]+|(?<=,)(?=,)|^(?=,)|(?<=,)$)/g) ?? []
      return Object.fromEntries(keys.map((k, i) => [k.trim(), (vals[i] ?? '').replace(/^\"|\"$/g, '').trim()]))
    })
    const res = await api.post('/assets/bulk', records)
    if (res.error) return toast.error(res.error)
    toast.success(`${res.inserted} assets imported.`); reload()
  }

  return (
    <div className="assets-root">
      <div className="dash-toolbar">
        <span className="dash-title">Asset Inventory</span>
        <div className="dash-toolbar-right">
          <Input placeholder="Search name, tag, user, serial..." value={search}
            onChange={e => setSearch(e.target.value)} className="assets-search" />
          <div className="assets-view-toggle">
            {['table', 'card', 'grid'].map(m => (
              <button key={m} className={`view-btn${viewMode === m ? ' active' : ''}`} onClick={() => setViewMode(m)} title={m}>
                {m === 'table' ? '☰' : m === 'card' ? '▤' : '⊞'}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <Button size="sm" variant="outline" onClick={() => setShowColMenu(v => !v)}>Columns</Button>
            {showColMenu && (
              <div className="col-menu">
                {colOrder.map(col => (
                  <label key={col} className="col-menu-item">
                    <input type="checkbox" checked={!hiddenCols.includes(col)} onChange={() => toggleCol(col)} />
                    {COL_LABELS[col]}
                  </label>
                ))}
              </div>
            )}
          </div>
          <Button size="sm" variant="outline" onClick={handleExport}>Export CSV</Button>
          <Button size="sm" variant="outline" onClick={() => importRef.current.click()}>Import CSV</Button>
          <input ref={importRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
          <Button size="sm" onClick={handleAddClick}>+ Add Asset</Button>
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="add-asset-modal-wide">
          <DialogTitle className="sr-only">Add Asset</DialogTitle>
          <div className="add-asset-split">

            {/** Left branding panel */}
            <div className="add-asset-branding">
              <div className="add-asset-branding-inner">
                <div className="auth-logo-box">IT</div>
                <h2 className="auth-brand-title">New Asset</h2>
                <p className="auth-brand-sub">Register a new device or resource into the inventory.</p>
                <ul className="auth-feature-list">
                  <li>📦 Track by asset tag & serial</li>
                  <li>👤 Assign to a user</li>
                  <li>🔧 Monitor equipment status</li>
                  <li>📄 Manage contract info</li>
                </ul>
              </div>
            </div>

            {/** Right form panel */}
            <div className="add-asset-form-panel">
              <div className="auth-form-header">
                <h2>Asset Details</h2>
                <p className="auth-form-desc">Fill in the fields below to register the asset</p>
              </div>
              <form onSubmit={handleSubmit} className="add-asset-form">
                <div className="add-asset-form-grid">
                  {FIELDS.map(({ key, label, required }) => (
                    <div key={key} className="assets-field">
                      <label>{label}{required && ' *'}</label>
                      <Input value={form[key]} onChange={set(key)} required={required} />
                    </div>
                  ))}
                  <div className="assets-field">
                    <label>Category</label>
                    <Select value={form.category} onValueChange={setVal('category')}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="assets-field">
                    <label>Contract Status</label>
                    <Select value={form.contractStatus} onValueChange={setVal('contractStatus')}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CONTRACT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="assets-field">
                    <label>Equipment Status</label>
                    <Select value={form.equipmentStatus} onValueChange={setVal('equipmentStatus')}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{EQUIPMENT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="assets-field">
                    <label>Date Acquired</label>
                    <Input type="date" value={form.dateAcquired} onChange={set('dateAcquired')} />
                  </div>
                </div>
                <div className="add-asset-modal-footer">
                  <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit" size="sm" disabled={saving}>{saving ? 'Saving...' : 'Save Asset'}</Button>
                </div>
              </form>
            </div>
            
          </div>
        </DialogContent>
      </Dialog>

      <div className="assets-grid">
        {loading ? (
          <div className="page-skeleton">{[...Array(8)].map((_, i) => <Skeleton key={i} />)}</div>
        ) : viewMode === 'table' ? (
          <Table>
            <TableHeader className="assets-sticky-header">
              <TableRow>
                {visibleCols.map(col => (
                  <TableHead key={col} draggable className="assets-th-drag"
                    onDragStart={() => onDragStart(col)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => onDrop(col)}>
                    {COL_LABELS[col]}
                  </TableHead>
                ))}
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={visibleCols.length + 1} className="table-empty">No assets found.</TableCell></TableRow>
              )}
              {filtered.map(a => (
                <TableRow key={a._id}>
                  {visibleCols.map(col => (
                    <TableCell key={col}>{renderCell(col, a, handlePatch)}</TableCell>
                  ))}
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <p>Delete <strong>{a.name}</strong>? This cannot be undone.</p>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(a._id)}>Delete</AlertDialogAction>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className={viewMode === 'card' ? 'assets-card-list' : 'assets-card-grid'}>
            {filtered.length === 0 && <p className="dash-empty">No assets found.</p>}
            {filtered.map(a => (
              <div key={a._id} className="asset-card">
                <div className="asset-card-header">
                  <code>{a.assetTag}</code>
                  <StatusBadge value={a.status} colorMap={STATUS_COLOR} />
                </div>
                <div className="asset-card-name">{a.name}</div>
                <div className="asset-card-meta">
                  <span>{a.category}</span>
                  <span>{a.manufacturer} {a.model}</span>
                  <span>{a.user || 'Unassigned'}</span>
                  <StatusBadge value={a.equipmentStatus} colorMap={EQUIP_COLOR} />
                </div>
                <div className="asset-card-footer">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <p>Delete <strong>{a.name}</strong>?</p>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(a._id)}>Delete</AlertDialogAction>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dash-statusbar">
        <span>{filtered.length} asset{filtered.length !== 1 ? 's' : ''}{search ? ' (filtered)' : ''}</span>
        <span>{assets.filter(a => a.status === 'Available').length} available · {assets.filter(a => a.status === 'Assigned').length} assigned</span>
      </div>
    </div>
  )
}