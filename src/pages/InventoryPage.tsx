import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { buildCsv, downloadCsv } from '../utils/csv';
import { loadTable, saveTable } from '../lib/repo';
import { defaultSapCatalog, initialInventoryRows, InventoryRow, InventoryStatus, MovementRow, SapItem, seededCompanies, seededUsers, UserRow } from '../data';

const statuses: InventoryStatus[] = ['da_assegnare', 'assegnato', 'installato', 'da_riconsegnare', 'riconsegnato', 'denunciato'];
const labels: Record<InventoryStatus, string> = { da_assegnare: 'Da assegnare', assegnato: 'Assegnato', installato: 'Installato', da_riconsegnare: 'Da riconsegnare', riconsegnato: 'Riconsegnato', denunciato: 'Denunciato' };

export function InventoryPage() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [companies, setCompanies] = useState(seededCompanies);
  const [sapCatalog, setSapCatalog] = useState<SapItem[]>([]);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [newRow, setNewRow] = useState<Omit<InventoryRow, 'id'>>({ serial: '', model: '', sap: '', status: 'da_assegnare', assignedTo: '-', provenance: 'SIELTE', notes: '', createdAt: new Date().toISOString().slice(0, 10) });
  const [movements, setMovements] = useState<MovementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const attachmentPickerRef = useRef<HTMLInputElement>(null);
  const attachmentRowRef = useRef<number | null>(null);
  const serialInputRef = useRef<HTMLInputElement>(null);
  const scannerStreamRef = useRef<MediaStream | null>(null);
  const scannerVideoRef = useRef<HTMLVideoElement>(null);
  const [scanPromptVisible, setScanPromptVisible] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [sortField, setSortField] = useState<keyof InventoryRow | ''>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentUser, setCurrentUser] = useState<UserRow | null>(null);

  const isTechnician = currentUser?.jobRole === 'Tecnico' || currentUser?.role === 'Tecnico';
  const currentUserFullName = `${currentUser?.firstName ?? ''} ${currentUser?.lastName ?? ''}`.trim();

  useEffect(() => {
    (async () => {
      setRows(await loadTable('inventory_rows','inventory_rows',initialInventoryRows));
      setSapCatalog(await loadTable('sap_catalog','sap_catalog',defaultSapCatalog));
      setMovements(await loadTable('movements_log','movements_log',[]));
      const loadedUsers = await loadTable('users_registry','users_registry',seededUsers);
      setUsers(loadedUsers);
      setCompanies(await loadTable('companies_registry','companies_registry',seededCompanies));
      const sid = Number(localStorage.getItem('session_user_id') || 0);
      setCurrentUser(loadedUsers.find((u) => u.id === sid) ?? null);
      setLoading(false);
    })();
  }, []);

  const persistRows = (next: InventoryRow[]) => { setRows(next); void saveTable('inventory_rows','inventory_rows', next); };
  const logMovement = (row: InventoryRow, action: string) => { const d = new Date(); const entry: MovementRow = { id: Date.now(), date: d.toLocaleDateString('it-IT'), time: d.toLocaleTimeString('it-IT'), user: 'operatore', serial: row.serial, sap: row.sap, status: row.status, provenance: row.provenance, action, technician: row.assignedTo, notes: row.notes, attachmentName: row.attachmentName, attachmentUrl: row.attachmentUrl }; const next = [entry, ...movements]; setMovements(next); void saveTable('movements_log','movements_log', next); };

  const applySort = (list: InventoryRow[]) => {
    if (!sortField) return list;
    return [...list].sort((a,b) => {
      const av = String(a[sortField] ?? '').toLowerCase();
      const bv = String(b[sortField] ?? '').toLowerCase();
      const cmp = av.localeCompare(bv, 'it');
      return sortDir === 'asc' ? cmp : -cmp;
    });
  };

  const visible = useMemo(() => rows
    .filter(r => ['da_assegnare', 'assegnato'].includes(r.status))
    .filter((r) => !isTechnician || (currentUserFullName && r.assignedTo === currentUserFullName))
    .filter(r => (!search || [r.serial, r.model, r.sap, r.notes, r.assignedTo, r.provenance, labels[r.status]].join(' ').toLowerCase().includes(search.toLowerCase())) && (!fromDate || r.createdAt >= fromDate) && (!toDate || r.createdAt <= toDate)), [rows, search, fromDate, toDate, isTechnician, currentUserFullName]);
  const daAssegnare = useMemo(() => applySort(visible.filter(r => r.status === 'da_assegnare')), [visible, sortField, sortDir]);
  const assegnati = useMemo(() => applySort(visible.filter(r => r.status === 'assegnato')), [visible, sortField, sortDir]);

  const onBlurConfirm = (id: number, field: keyof InventoryRow, value: string) => { const curr = rows.find(r => r.id === id); if (!curr || String(curr[field]) === value) return; if (window.confirm('Applicare la modifica?')) { const updated = { ...curr, [field]: value }; const next = rows.map(r => r.id === id ? updated : r); persistRows(next); logMovement(updated, `Modifica ${String(field)}`); } };
  const onSort = (field: keyof InventoryRow) => {
    if (sortField === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };
  const deleteRowAction = (row: InventoryRow) => {
    const full = window.confirm('Confermi eliminazione intera riga?');
    if (!full) return;
    const next = rows.filter((r) => r.id !== row.id);
    persistRows(next);
    logMovement(row, 'Eliminazione riga');
  };
  const deleteAttachmentAction = (row: InventoryRow, idx: number) => {
    const urls = [ ...(row.attachmentUrls ?? (row.attachmentUrl ? [row.attachmentUrl] : [])) ];
    const names = [ ...(row.attachmentNames ?? (row.attachmentName ? [row.attachmentName] : [])) ];
    if (!urls[idx]) return;
    if (!window.confirm('Confermi eliminazione allegato selezionato?')) return;
    urls.splice(idx, 1);
    names.splice(idx, 1);
    const updated = { ...row, attachmentNames: urls.length ? names : [], attachmentUrls: urls.length ? urls : [], attachmentName: names[0], attachmentUrl: urls[0] };
    persistRows(rows.map((r) => r.id === row.id ? updated : r));
    logMovement(updated, 'Eliminazione allegato singolo');
  };

  const exportCsv = (list: InventoryRow[], name: string) => { const csv = buildCsv(['seriale','modello','sap','stato','assegnato','provenienza','note','data'], list.map(r => [r.serial, r.model, r.sap, labels[r.status], r.assignedTo, r.provenance, r.notes, r.createdAt])); downloadCsv(csv, name); };

  const stopScanner = () => { scannerStreamRef.current?.getTracks().forEach((t) => t.stop()); scannerStreamRef.current = null; setScannerOpen(false); };
  const openScanner = async () => {
    if (!('BarcodeDetector' in window)) { window.alert('Scanner barcode non supportato su questo browser.'); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      scannerStreamRef.current = stream;
      setScannerOpen(true);
      setTimeout(() => { if (scannerVideoRef.current) scannerVideoRef.current.srcObject = stream; }, 0);
      const Detector = (window as any).BarcodeDetector;
      const detector = new Detector({ formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'qr_code'] });
      const tick = async () => {
        if (!scannerVideoRef.current || !scannerStreamRef.current) return;
        try {
          const codes = await detector.detect(scannerVideoRef.current);
          if (codes?.length) {
            const value = String(codes[0].rawValue || '').trim();
            if (value) {
              setNewRow((prev) => ({ ...prev, serial: value }));
              stopScanner();
              serialInputRef.current?.focus();
              return;
            }
          }
        } catch {}
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    } catch { window.alert('Impossibile accedere alla fotocamera.'); }
  };

  useEffect(() => () => stopScanner(), []);

  const register = (e: FormEvent) => { e.preventDefault(); if (!newRow.serial) return; const row = { ...newRow, id: Date.now() }; const next = [row, ...rows]; persistRows(next); logMovement(row, 'Registrazione materiale'); setNewRow({ ...newRow, serial: '', model: '', sap: '', notes: '' }); };
  const onAttachmentChange = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; const rowId = attachmentRowRef.current; if (!file || rowId === null) return; const fileUrl = URL.createObjectURL(file); const curr = rows.find(r => r.id === rowId); if (!curr) return; const names = [ ...(curr.attachmentNames ?? (curr.attachmentName ? [curr.attachmentName] : [])) ]; const urls = [ ...(curr.attachmentUrls ?? (curr.attachmentUrl ? [curr.attachmentUrl] : [])) ]; if (urls.length >= 3) { window.alert('Massimo 3 allegati per riga.'); event.target.value = ''; return; } names.push(file.name); urls.push(fileUrl); const updated = { ...curr, attachmentNames: names, attachmentUrls: urls, attachmentName: names[0], attachmentUrl: urls[0] }; const next = rows.map(r => r.id === rowId ? updated : r); persistRows(next); logMovement(updated, 'Aggiornamento allegato'); event.target.value = ''; };

  if (loading) return <section><h2>Seriali materiali (da assegnare / assegnati)</h2><p>Caricamento dati...</p></section>;

  return <section><h2>Seriali materiali (da assegnare / assegnati)</h2>
    <div className='new-modem-form-titles'><span>Seriale</span><span>Descrizione materiale</span><span>SAP</span><span>Stato</span><span>Assegnato a</span><span>Provenienza</span><span>Note</span><span>Azione</span></div>
    <form className='new-modem-form' onSubmit={register}><input ref={serialInputRef} onFocus={() => setScanPromptVisible(true)} value={newRow.serial} onChange={e => setNewRow({ ...newRow, serial: e.target.value })} placeholder='Seriale'/><input value={newRow.model} onChange={e => setNewRow({ ...newRow, model: e.target.value })} placeholder='Descrizione materiale'/><input value={newRow.sap} onChange={e => { const sap = e.target.value.trim(); const f = sapCatalog.find(s => s.sapCode === sap); setNewRow({ ...newRow, sap, model: f ? f.modelName : '' }); }} placeholder='SAP'/><select value={newRow.status} onChange={e => setNewRow({ ...newRow, status: e.target.value as InventoryStatus })}>{statuses.map(s => <option key={s} value={s}>{labels[s]}</option>)}</select><select value={newRow.assignedTo} onChange={e => setNewRow({ ...newRow, assignedTo: e.target.value })}><option value='-'>-</option>{users.map(u => <option key={u.id} value={`${u.firstName} ${u.lastName}`}>{u.firstName} {u.lastName}</option>)}</select><select value={newRow.provenance} onChange={e => setNewRow({ ...newRow, provenance: e.target.value })}>{companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select><input value={newRow.notes} onChange={e => setNewRow({ ...newRow, notes: e.target.value })} placeholder='Note'/><button className='action-green' type='submit'>Registra materiale</button></form>
    <div className='filters-row modern-filters'><input className='search-input' value={search} onChange={e => setSearch(e.target.value)} placeholder='Cerca...' /><input type='date' className='modern-input' value={fromDate} onChange={e => setFromDate(e.target.value)}/><input type='date' className='modern-input' value={toDate} onChange={e => setToDate(e.target.value)}/><button className='modern-export-btn' onClick={() => exportCsv(visible, 'magazzino.csv')}>Export Excel/CSV</button></div>
    {scanPromptVisible && !scannerOpen && <div className='scan-prompt'><span>Vuoi scannerizzare?</span><button type='button' onClick={() => { setScanPromptVisible(false); openScanner(); }}>Si</button><button type='button' onClick={() => setScanPromptVisible(false)}>No</button></div>}
    {scannerOpen && <div className='scanner-overlay'><div className='scanner-box'><video ref={scannerVideoRef} autoPlay playsInline muted /><button type='button' onClick={stopScanner}>Chiudi scanner</button></div></div>}
    <input ref={attachmentPickerRef} type='file' accept='image/*' capture='environment' style={{ display: 'none' }} onChange={onAttachmentChange} />
    <h3>Materiali - Da assegnare</h3><div className='table-wrap'><table className='compact-table with-separators inventory-table'><thead><tr><th onClick={() => onSort('serial')}>Seriale</th><th onClick={() => onSort('model')}>Modello</th><th onClick={() => onSort('sap')}>SAP</th><th onClick={() => onSort('status')}>Stato</th><th onClick={() => onSort('assignedTo')}>Assegnato a</th><th onClick={() => onSort('provenance')}>Provenienza</th><th onClick={() => onSort('notes')}>Note</th><th>Allegati</th></tr></thead><tbody>{daAssegnare.map(r => <tr key={r.id}><td>{r.serial}</td><td>{r.model}</td><td>{r.sap}</td><td><select value={r.status} onChange={e => onBlurConfirm(r.id, 'status', e.target.value)}>{statuses.map(s => <option key={s} value={s}>{labels[s]}</option>)}</select></td><td><select value={r.assignedTo} onChange={e => onBlurConfirm(r.id, 'assignedTo', e.target.value)}><option value='-'>-</option>{users.map(u => <option key={u.id} value={`${u.firstName} ${u.lastName}`}>{u.firstName} {u.lastName}</option>)}</select></td><td><select value={r.provenance} onChange={e => onBlurConfirm(r.id, 'provenance', e.target.value)}>{companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select></td><td><input defaultValue={r.notes} onBlur={e => onBlurConfirm(r.id, 'notes', e.target.value)} /></td><td className='attachment-cell'><button type='button' className='icon-btn' onClick={() => { attachmentRowRef.current = r.id; attachmentPickerRef.current?.click(); }}>📎</button>{(r.attachmentUrls ?? (r.attachmentUrl ? [r.attachmentUrl] : [])).slice(0,3).map((url,idx)=><span key={url+idx}><button type='button' className='icon-btn' onClick={() => window.open(url, '_blank')}>👁️</button><button type='button' className='icon-btn danger' onClick={() => deleteAttachmentAction(r, idx)}>✖️</button></span>)}<button type='button' className='icon-btn danger' onClick={() => deleteRowAction(r)}>🗑️</button></td></tr>)}</tbody></table></div>
    <h3>Materiali - Assegnati</h3><div className='table-wrap'><table className='compact-table with-separators inventory-table'><thead><tr><th onClick={() => onSort('serial')}>Seriale</th><th onClick={() => onSort('model')}>Modello</th><th onClick={() => onSort('sap')}>SAP</th><th onClick={() => onSort('status')}>Stato</th><th onClick={() => onSort('assignedTo')}>Assegnato a</th><th onClick={() => onSort('provenance')}>Provenienza</th><th onClick={() => onSort('notes')}>Note</th><th>Allegati</th></tr></thead><tbody>{assegnati.map(r => <tr key={r.id}><td>{r.serial}</td><td>{r.model}</td><td>{r.sap}</td><td><select value={r.status} onChange={e => onBlurConfirm(r.id, 'status', e.target.value)}>{statuses.map(s => <option key={s} value={s}>{labels[s]}</option>)}</select></td><td><select value={r.assignedTo} onChange={e => onBlurConfirm(r.id, 'assignedTo', e.target.value)}><option value='-'>-</option>{users.map(u => <option key={u.id} value={`${u.firstName} ${u.lastName}`}>{u.firstName} {u.lastName}</option>)}</select></td><td><select value={r.provenance} onChange={e => onBlurConfirm(r.id, 'provenance', e.target.value)}>{companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select></td><td><input defaultValue={r.notes} onBlur={e => onBlurConfirm(r.id, 'notes', e.target.value)} /></td><td className='attachment-cell'><button type='button' className='icon-btn' onClick={() => { attachmentRowRef.current = r.id; attachmentPickerRef.current?.click(); }}>📎</button>{(r.attachmentUrls ?? (r.attachmentUrl ? [r.attachmentUrl] : [])).slice(0,3).map((url,idx)=><span key={url+idx}><button type='button' className='icon-btn' onClick={() => window.open(url, '_blank')}>👁️</button><button type='button' className='icon-btn danger' onClick={() => deleteAttachmentAction(r, idx)}>✖️</button></span>)}<button type='button' className='icon-btn danger' onClick={() => deleteRowAction(r)}>🗑️</button></td></tr>)}</tbody></table></div>
  </section>;
}
