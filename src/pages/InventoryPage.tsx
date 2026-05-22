import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { defaultSapCatalog, initialInventoryRows, InventoryRow, InventoryStatus, MovementRow, SapItem, seededCompanies, seededUsers, UserRow } from '../data';

const statuses: InventoryStatus[] = ['da_assegnare', 'assegnato', 'installato', 'da_riconsegnare', 'riconsegnato', 'denunciato'];
const labels: Record<InventoryStatus, string> = { da_assegnare: 'Da assegnare', assegnato: 'Assegnato', installato: 'Installato', da_riconsegnare: 'Da riconsegnare', riconsegnato: 'Riconsegnato', denunciato: 'Denunciato' };

export function InventoryPage() {
  const [rows, setRows] = useState<InventoryRow[]>(initialInventoryRows);
  const [users, setUsers] = useState<UserRow[]>(seededUsers);
  const [companies, setCompanies] = useState(seededCompanies);
  const [sapCatalog, setSapCatalog] = useState<SapItem[]>(defaultSapCatalog);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [newRow, setNewRow] = useState<Omit<InventoryRow, 'id'>>({ serial: '', model: '', sap: '', status: 'da_assegnare', assignedTo: '-', provenance: 'SIELTE', notes: '', createdAt: new Date().toISOString().slice(0, 10) });
  const [movements, setMovements] = useState<MovementRow[]>([]);
  const attachmentPickerRef = useRef<HTMLInputElement>(null);
  const attachmentRowRef = useRef<number | null>(null);

  useEffect(() => {
    const inv = localStorage.getItem('inventory_rows'); const usr = localStorage.getItem('users_registry'); const sap = localStorage.getItem('sap_catalog'); const mov = localStorage.getItem('movements_log'); const cmp = localStorage.getItem('companies_registry');
    if (inv) setRows(JSON.parse(inv)); if (usr) setUsers(JSON.parse(usr)); if (sap) setSapCatalog(JSON.parse(sap)); if (mov) setMovements(JSON.parse(mov)); if (cmp) setCompanies(JSON.parse(cmp));
  }, []);

  const persistRows = (next: InventoryRow[]) => { setRows(next); localStorage.setItem('inventory_rows', JSON.stringify(next)); };
  const logMovement = (row: InventoryRow, action: string) => { const d = new Date(); const entry: MovementRow = { id: Date.now(), date: d.toLocaleDateString('it-IT'), time: d.toLocaleTimeString('it-IT'), user: 'operatore', serial: row.serial, sap: row.sap, status: row.status, provenance: row.provenance, action, technician: row.assignedTo, notes: row.notes, attachmentName: row.attachmentName, attachmentUrl: row.attachmentUrl }; const next = [entry, ...movements]; setMovements(next); localStorage.setItem('movements_log', JSON.stringify(next)); };

  const visible = useMemo(() => rows.filter(r => ['da_assegnare', 'assegnato'].includes(r.status)).filter(r => (!search || [r.serial, r.model, r.sap, r.notes, r.assignedTo, r.provenance, labels[r.status]].join(' ').toLowerCase().includes(search.toLowerCase())) && (!fromDate || r.createdAt >= fromDate) && (!toDate || r.createdAt <= toDate)), [rows, search, fromDate, toDate]);

  const onBlurConfirm = (id: number, field: keyof InventoryRow, value: string) => { const curr = rows.find(r => r.id === id); if (!curr || String(curr[field]) === value) return; if (window.confirm('Applicare la modifica?')) { const updated = { ...curr, [field]: value }; const next = rows.map(r => r.id === id ? updated : r); persistRows(next); logMovement(updated, `Modifica ${String(field)}`); } };
  const exportCsv = (list: InventoryRow[], name: string) => { const head = 'seriale,modello,sap,stato,assegnato,provenienza,note,data
'; const body = list.map(r => `${r.serial},${r.model},${r.sap},${labels[r.status]},${r.assignedTo},${r.provenance},${r.notes},${r.createdAt}`).join('
'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([head + body], { type: 'text/csv' })); a.download = name; a.click(); };
  const register = (e: FormEvent) => { e.preventDefault(); if (!newRow.serial) return; const row = { ...newRow, id: Date.now() }; const next = [row, ...rows]; persistRows(next); logMovement(row, 'Registrazione materiale'); setNewRow({ ...newRow, serial: '', model: '', sap: '', notes: '' }); };
  const onAttachmentChange = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; const rowId = attachmentRowRef.current; if (!file || rowId === null) return; const fileUrl = URL.createObjectURL(file); const curr = rows.find(r => r.id === rowId); if (!curr) return; const updated = { ...curr, attachmentName: file.name, attachmentUrl: fileUrl }; const next = rows.map(r => r.id === rowId ? updated : r); persistRows(next); logMovement(updated, 'Aggiornamento allegato'); event.target.value = ''; };

  return <section><h2>Seriali materiali (da assegnare / assegnati)</h2>
    <form className='new-modem-form' onSubmit={register}><input value={newRow.serial} onChange={e => setNewRow({ ...newRow, serial: e.target.value })} placeholder='Seriale'/><input value={newRow.model} onChange={e => setNewRow({ ...newRow, model: e.target.value })} placeholder='Descrizione materiale'/><input value={newRow.sap} onChange={e => { const sap = e.target.value; const f = sapCatalog.find(s => s.sapCode === sap); setNewRow({ ...newRow, sap, model: f ? f.modelName : newRow.model }); }} placeholder='SAP'/><select value={newRow.status} onChange={e => setNewRow({ ...newRow, status: e.target.value as InventoryStatus })}>{statuses.map(s => <option key={s} value={s}>{labels[s]}</option>)}</select><select value={newRow.assignedTo} onChange={e => setNewRow({ ...newRow, assignedTo: e.target.value })}><option value='-'>-</option>{users.map(u => <option key={u.id} value={`${u.firstName} ${u.lastName}`}>{u.firstName} {u.lastName}</option>)}</select><select value={newRow.provenance} onChange={e => setNewRow({ ...newRow, provenance: e.target.value })}>{companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select><input value={newRow.notes} onChange={e => setNewRow({ ...newRow, notes: e.target.value })} placeholder='Note'/><button className='action-green' type='submit'>Registra materiale</button></form>
    <div className='filters-row modern-filters'><input className='search-input' value={search} onChange={e => setSearch(e.target.value)} placeholder='Cerca...' /><input type='date' className='modern-input' value={fromDate} onChange={e => setFromDate(e.target.value)}/><input type='date' className='modern-input' value={toDate} onChange={e => setToDate(e.target.value)}/><button className='modern-export-btn' onClick={() => exportCsv(visible, 'magazzino.csv')}>Export Excel/CSV</button></div>
    <input ref={attachmentPickerRef} type='file' accept='image/*' capture='environment' style={{ display: 'none' }} onChange={onAttachmentChange} />
    <table className='compact-table with-separators'><thead><tr><th>Seriale</th><th>Modello</th><th>SAP</th><th>Stato</th><th>Assegnato a</th><th>Provenienza</th><th>Note</th></tr></thead><tbody>{visible.map(r => <tr key={r.id}><td>{r.serial}</td><td>{r.model}</td><td>{r.sap}</td><td><select value={r.status} onChange={e => onBlurConfirm(r.id, 'status', e.target.value)}>{statuses.map(s => <option key={s} value={s}>{labels[s]}</option>)}</select></td><td><select value={r.assignedTo} onChange={e => onBlurConfirm(r.id, 'assignedTo', e.target.value)}><option value='-'>-</option>{users.map(u => <option key={u.id} value={`${u.firstName} ${u.lastName}`}>{u.firstName} {u.lastName}</option>)}</select></td><td><select value={r.provenance} onChange={e => onBlurConfirm(r.id, 'provenance', e.target.value)}>{companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select></td><td><input defaultValue={r.notes} onBlur={e => onBlurConfirm(r.id, 'notes', e.target.value)} /></td></tr>)}</tbody></table>
  </section>;
}
