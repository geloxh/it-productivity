import { useState, useRef } from 'react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const TICKET_FIELDS = ['title', 'description', 'priority', 'status']
const REQUIRED = ['title', 'description']

export default function BulkImportModal({ open, onClose, onImport }) {
    const [rows, setRows] = useState([])
    const [headers, setHeaders] = useState([])
    const [mapping, setMapping] = useState({})
    const [dragging, setDragging] = useState(false)
    const inputRef = useRef()

    const parseFile = (file) => {
        const ext = file.name.split('.').pop().toLowerCase()
        if (ext === 'csv') {
            Papa.parse(file, {
                header: true, skipEmptyLines: true,
                complete: ({ data, meta }) => { setHeaders(meta.fields); setRows(data); autoMap(meta.fields) }
            })
        } else {
            const reader = new FileReader()
            reader.onload = (e) => {
                const wb = XLSX.read(e.target.result, { type: 'array' })
                const ws = wb.Sheets[wb.SheetNames[0]]
                const data = XLSX.utils.sheet_to_json(ws, { defval: '' })
                const fields = data.length ? Object.keys(data[0]) : []
                setHeaders(fields); setRows(data); autoMap(fields)
            }
            reader.readAsArrayBuffer(file)
        }
    }

    const autoMap = (fields) => {
        const m = {}
        TICKET_FIELDS.forEach(tf => {
            const match = fields.find(f => f.toLowerCase().includes(tf.toLowerCase()))
            if (match) m[tf] = match
        })
        setMapping(m)
    }

    const handleDrop = (e) => {
        e.preventDefault(); setDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) parseFile(file)
    }

    const handleImport = () => {
        const missing = REQUIRED.filter(f => !mapping[f])
        if (missing.length) return alert(`Map required fields: ${missing.join(', ')}`)
        const tickets = rows.map(row =>
            Object.fromEntries(TICKET_FIELDS.filter(f => mapping[f]).map(f => [f, row[mapping[f]]]))
        )
        onImport(tickets)
        handleClose()
    }

    const handleClose = () => { setRows([]); setHeaders([]); setMapping({}); onClose() }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Import Tickets (CSV / Excel)</DialogTitle></DialogHeader>

                {!rows.length ? (
                    <div
                        className={`bulk-drop-zone${dragging ? ' bulk-drop-zone--over' : ''}`}
                        onDragOver={e => { e.preventDefault(); setDragging(true) }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current.click()}
                    >
                        <span>Drop CSV or Excel file here, or click to browse</span>
                        <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" hidden
                            onChange={e => e.target.files[0] && parseFile(e.target.files[0])} />
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <p className="text-sm text-muted-foreground">{rows.length} rows detected. Map columns:</p>
                        <div className="bulk-mapping-grid">
                            {TICKET_FIELDS.map(field => (
                                <div key={field} className="bulk-mapping-row">
                                    <span className="bulk-mapping-label">{field}{REQUIRED.includes(field) ? ' *' : ''}</span>
                                    <Select value={mapping[field] ?? ''} onValueChange={v => setMapping(m => ({ ...m, [field]: v }))}>
                                        <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="— skip —" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">— skip —</SelectItem>
                                            {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))}
                        </div>
                        <div className="bulk-preview">
                            <p className="text-xs text-muted-foreground mb-1">Preview (first 3 rows)</p>
                            {rows.slice(0, 3).map((row, i) => (
                                <div key={i} className="bulk-preview-row">
                                    {TICKET_FIELDS.filter(f => mapping[f]).map(f => (
                                        <span key={f}><b>{f}:</b> {row[mapping[f]]}</span>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={handleClose}>Cancel</Button>
                            <Button size="sm" onClick={handleImport}>Import {rows.length} tickets</Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}