import { ChangeEvent, FormEvent, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { initialInventoryRows, InventoryRow, InventoryStatus, MovementRow, seededUsers } from '../data';

const initialWidths = [180, 140, 80, 105, 130, 200, 90];
const statuses: InventoryStatus[] = ['giacente', 'assegnato', 'installato', 'da_riconsegnare', 'riconsegnato', 'guasto', 'scaricato'];
const userNames = seededUsers.map((u) => `${u.firstName} ${u.lastName}`);

const formatNow = () => {
  const now = new Date();
  const date = now.toLocaleDateString('it-IT');
  const time = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return { date, time };
};

export function InventoryPage() {
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status');
  const [colWidths, setColWidths] = useState<number[]>(initialWidths);
  const [rows, setRows] = useState<InventoryRow[]>(initialInventoryRows);
  const [movements, setMovements] = useState<MovementRow[]>([]);

  const [newRow, setNewRow] = useState<Omit<InventoryRow, 'id'>>({
    serial: '',
    model: '',
    sap: '',
    status: 'giacente',
    assignedTo: '-',
    notes: '',
    attachmentName: ''
  });

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
  }, [search, statusFilter, rows]);

  const startResize = (index: number, startX: number) => {
    const startWidth = colWidths[index];
    const onMove = (event: MouseEvent) => {
      const delta = event.clientX - startX;
      setColWidths((prev) => prev.map((w, i) => (i === index ? Math.max(60, startWidth + delta) : w)));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const logMovement = (row: InventoryRow, action: string) => {
    const { date, time } = formatNow();
    setMovements((prev) => [
      {
        id: Date.now() + Math.floor(Math.random() * 1000),
        date,
        time,
        user: 'operatore',
        serial: row.serial,
        action,
        technician: row.assignedTo,
        notes: row.notes,
        attachmentName: row.attachmentName
      },
      ...prev
    ]);
    localStorage.setItem('movements_log', JSON.stringify([
      {
        id: Date.now(),
        date,
        time,
        user: 'operatore',
        serial: row.serial,
        action,
        technician: row.assignedTo,
        notes: row.notes,
        attachmentName: row.attachmentName
      },
      ...movements
    ]));
  };

  const registerModem = (event: FormEvent) => {
    event.preventDefault();
    if (!newRow.serial.trim()) return;
    const created: InventoryRow = { ...newRow, id: Date.now(), serial: newRow.serial.trim() };
    setRows((prev) => [created, ...prev]);
    logMovement(created, 'Registrazione nuovo modem');
    setNewRow({ serial: '', model: '', sap: '', status: 'giacente', assignedTo: '-', notes: '', attachmentName: '' });
  };

  const updateRow = (id: number, patch: Partial<InventoryRow>, action: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, ...patch };
        logMovement(updated, action);
        return updated;
      })
    );
  };

  const openAttachmentPicker = (rowId: number) => {
    attachmentRowRef.current = rowId;
    attachmentPickerRef.current?.click();
  };

  const onAttachmentChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const rowId = attachmentRowRef.current;
    if (!file || rowId === null) return;
    updateRow(rowId, { attachmentName: file.name }, 'Aggiornamento allegato');
    event.target.value = '';
  };

  return (
    <section>
      <h2>Seriali modem</h2>

      <form className="new-modem-form" onSubmit={registerModem}>
        <input value={newRow.serial} onChange={(e) => setNewRow({ ...newRow, serial: e.target.value })} placeholder="Seriale" />
        <input value={newRow.model} onChange={(e) => setNewRow({ ...newRow, model: e.target.value })} placeholder="Modello" />
        <input value={newRow.sap} onChange={(e) => setNewRow({ ...newRow, sap: e.target.value })} placeholder="SAP" />
        <select value={newRow.status} onChange={(e) => setNewRow({ ...newRow, status: e.target.value as InventoryStatus })}>
          {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <select value={newRow.assignedTo} onChange={(e) => setNewRow({ ...newRow, assignedTo: e.target.value })}>
          <option value="-">-</option>
          {userNames.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
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
              {['Seriale', 'Modello', 'SAP', 'Stato', 'Assegnato a', 'Note', 'Allegati'].map((header, index) => (
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
                <td>
                  <select value={row.assignedTo} onChange={(e) => updateRow(row.id, { assignedTo: e.target.value }, 'Cambio tecnico assegnato')}>
                    <option value="-">-</option>
                    {userNames.map((name) => <option key={name} value={name}>{name}</option>)}
                  </select>
                </td>
                <td>
                  <input value={row.notes} onChange={(e) => updateRow(row.id, { notes: e.target.value }, 'Aggiornamento note')} />
                </td>
                <td>
                  <button type="button" className="attach-btn" onClick={() => openAttachmentPicker(row.id)}>◻</button>
                  <small>{row.attachmentName ?? ''}</small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
