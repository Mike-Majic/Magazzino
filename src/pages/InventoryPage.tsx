import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { defaultSapCatalog, initialInventoryRows, InventoryRow, InventoryStatus, MovementRow, SapItem, seededUsers, UserRow } from '../data';

const initialWidths = [170, 150, 90, 105, 130, 180, 120, 70];
const statuses: InventoryStatus[] = ['giacente', 'assegnato', 'installato', 'da_riconsegnare', 'riconsegnato', 'guasto', 'scaricato'];
const formatNow = () => {
  const now = new Date();
  return {
    date: now.toLocaleDateString('it-IT'),
    time: now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };
};

export function InventoryPage() {
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status');
  const [colWidths, setColWidths] = useState<number[]>(initialWidths);
  const [rows, setRows] = useState<InventoryRow[]>(initialInventoryRows);
  const [movements, setMovements] = useState<MovementRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>(seededUsers);
  const [sapCatalog, setSapCatalog] = useState<SapItem[]>(defaultSapCatalog);

  const [newRow, setNewRow] = useState<Omit<InventoryRow, 'id'>>({ serial: '', model: '', sap: '', status: 'giacente', assignedTo: '-', notes: '' });

  useEffect(() => {
    const storedUsers = localStorage.getItem('users_registry');
    const storedSap = localStorage.getItem('sap_catalog');
    const storedMovements = localStorage.getItem('movements_log');
    if (storedUsers) setUsers(JSON.parse(storedUsers));
    if (storedSap) setSapCatalog(JSON.parse(storedSap));
    if (storedMovements) setMovements(JSON.parse(storedMovements));
  }, []);

  const userNames = users.map((u) => `${u.firstName} ${u.lastName}`);

  const attachmentPickerRef = useRef<HTMLInputElement>(null);
  const attachmentRowRef = useRef<number | null>(null);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesStatus = statusFilter ? row.status === statusFilter : true;
      if (!matchesStatus) return false;
      if (!keyword) return true;
      return [row.serial, row.model, row.sap, row.status, row.assignedTo, row.notes, row.attachmentName ?? ''].join(' ').toLowerCase().includes(keyword);
    });
  }, [rows, search, statusFilter]);

  const startResize = (index: number, startX: number) => {
    const startWidth = colWidths[index];
    const onMove = (event: MouseEvent) => setColWidths((prev) => prev.map((w, i) => (i === index ? Math.max(60, startWidth + event.clientX - startX) : w)));
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const logMovement = (row: InventoryRow, action: string) => {
    const { date, time } = formatNow();
    const entry: MovementRow = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      date,
      time,
      user: 'operatore',
      serial: row.serial,
      action,
      technician: row.assignedTo,
      notes: row.notes,
      attachmentName: row.attachmentName,
      attachmentUrl: row.attachmentUrl
    };
    setMovements((prev) => {
      const next = [entry, ...prev];
      localStorage.setItem('movements_log', JSON.stringify(next));
      return next;
    });
  };

  const onSapChange = (sapCode: string) => {
    const found = sapCatalog.find((item) => item.sapCode.toLowerCase() === sapCode.toLowerCase());
    setNewRow((prev) => ({ ...prev, sap: sapCode, model: found ? found.modelName : prev.model }));
  };

  const registerModem = (event: FormEvent) => {
    event.preventDefault();
    if (!newRow.serial.trim()) return;
    const created: InventoryRow = { ...newRow, id: Date.now(), serial: newRow.serial.trim() };
    setRows((prev) => [created, ...prev]);
    logMovement(created, 'Registrazione nuovo modem');
    setNewRow({ serial: '', model: '', sap: '', status: 'giacente', assignedTo: '-', notes: '' });
  };

  const updateRow = (id: number, patch: Partial<InventoryRow>, action: string) => {
    const current = rows.find((r) => r.id === id);
    if (!current) return;
    const updated = { ...current, ...patch };
    setRows((prev) => prev.map((r) => (r.id === id ? updated : r)));
    logMovement(updated, action);
  };

  const removeRow = (id: number) => {
    const current = rows.find((r) => r.id === id);
    if (!current) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
    logMovement(current, 'Cancellazione riga modem');
  };

  const openAttachmentPicker = (rowId: number) => {
    attachmentRowRef.current = rowId;
    attachmentPickerRef.current?.click();
  };

  const onAttachmentChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const rowId = attachmentRowRef.current;
    if (!file || rowId === null) return;
    const fileUrl = URL.createObjectURL(file);
    updateRow(rowId, { attachmentName: file.name, attachmentUrl: fileUrl }, 'Aggiornamento allegato');
    event.target.value = '';
  };

  return (
    <section>
      <h2>Seriali modem</h2>
      <form className="new-modem-form" onSubmit={registerModem}>
        <input value={newRow.serial} onChange={(e) => setNewRow({ ...newRow, serial: e.target.value })} placeholder="Seriale" />
        <input value={newRow.model} onChange={(e) => setNewRow({ ...newRow, model: e.target.value })} placeholder="Descrizione modem" />
        <input value={newRow.sap} onChange={(e) => onSapChange(e.target.value)} placeholder="SAP" list="sap-list" />
        <datalist id="sap-list">{sapCatalog.map((s) => <option key={s.id} value={s.sapCode}>{s.modelName}</option>)}</datalist>
        <select value={newRow.status} onChange={(e) => setNewRow({ ...newRow, status: e.target.value as InventoryStatus })}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select>
        <select value={newRow.assignedTo} onChange={(e) => setNewRow({ ...newRow, assignedTo: e.target.value })}><option value="-">-</option>{userNames.map((name) => <option key={name} value={name}>{name}</option>)}</select>
        <input value={newRow.notes} onChange={(e) => setNewRow({ ...newRow, notes: e.target.value })} placeholder="Note" />
        <button type="submit">Registra modem</button>
      </form>

      <input className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cerca per seriale, modello, SAP, stato, assegnato o note" />
      <input ref={attachmentPickerRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={onAttachmentChange} />

      <div className="table-wrap">
        <table className="compact-table with-separators">
          <colgroup>{colWidths.map((w, i) => <col key={i} style={{ width: `${w}px` }} />)}</colgroup>
          <thead>
            <tr>
              {['Seriale', 'Modello', 'SAP', 'Stato', 'Assegnato a', 'Note', 'Allegato', 'Azioni'].map((header, index) => (
                <th key={header}><span>{header}</span><span className="resize-handle" onMouseDown={(e) => startResize(index, e.clientX)} /></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id}>
                <td>{row.serial}</td>
                <td>{row.model}</td>
                <td>{row.sap}</td>
                <td>{row.status}</td>
                <td><select value={row.assignedTo} onChange={(e) => updateRow(row.id, { assignedTo: e.target.value }, 'Cambio tecnico assegnato')}><option value="-">-</option>{userNames.map((name) => <option key={name} value={name}>{name}</option>)}</select></td>
                <td><input value={row.notes} onChange={(e) => updateRow(row.id, { notes: e.target.value }, 'Aggiornamento note')} /></td>
                <td className="attachment-cell">
                  <button type="button" className="icon-btn" title="Carica allegato" onClick={() => openAttachmentPicker(row.id)}>📎</button>
                  {row.attachmentUrl && <button type="button" className="icon-btn" title="Apri allegato" onClick={() => window.open(row.attachmentUrl, '_blank')}>👁️</button>}
                  {row.attachmentName && <button type="button" className="icon-btn danger" title="Elimina allegato" onClick={() => updateRow(row.id, { attachmentName: '', attachmentUrl: '' }, 'Elimina allegato')}>🗑️</button>}
                </td>
                <td><button type="button" className="icon-btn danger" onClick={() => removeRow(row.id)}>Elimina</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
