import { useEffect, useMemo, useState } from 'react';
import { initialInventoryRows, InventoryRow, InventoryStatus } from '../data';

const labels: Record<InventoryStatus, string> = { da_assegnare: 'Da assegnare', assegnato: 'Assegnato', installato: 'Installato', da_riconsegnare: 'Da riconsegnare', riconsegnato: 'Riconsegnato', denunciato: 'Denunciato' };
const statuses: InventoryStatus[] = ['da_assegnare', 'assegnato', 'installato', 'da_riconsegnare', 'riconsegnato', 'denunciato'];

export function InstalledModemsPage() {
  const [rows, setRows] = useState<InventoryRow[]>(initialInventoryRows);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    const inv = localStorage.getItem('inventory_rows');
    if (inv) setRows(JSON.parse(inv));
  }, []);

  const persist = (next: InventoryRow[]) => {
    setRows(next);
    localStorage.setItem('inventory_rows', JSON.stringify(next));
  };

  const filtered = useMemo(
    () =>
      rows
        .filter((r) => r.status === 'installato')
        .filter(
          (r) =>
            (!search || [r.serial, r.model, r.sap, r.assignedTo, r.notes].join(' ').toLowerCase().includes(search.toLowerCase())) &&
            (!fromDate || r.createdAt >= fromDate) &&
            (!toDate || r.createdAt <= toDate)
        ),
    [rows, search, fromDate, toDate]
  );

  const exp = () => {
    const csv =
      'seriale,modello,sap,stato,tecnico,note,data\n' +
      filtered.map((r) => `${r.serial},${r.model},${r.sap},${labels[r.status]},${r.assignedTo},${r.notes},${r.createdAt}`).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'installati.csv';
    a.click();
  };

  return (
    <section>
      <h2>Materiali installati</h2>
      <div className="filters-row modern-filters">
        <input className="search-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filtro seriale/modello..." />
        <input type="date" className="modern-input" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <input type="date" className="modern-input" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        <button className="modern-export-btn" onClick={exp}>Export Excel/CSV</button>
      </div>
      <table className="compact-table with-separators">
        <thead>
          <tr><th>Seriale</th><th>Modello</th><th>SAP</th><th>Stato</th><th>Tecnico</th><th>Note</th></tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <tr key={r.id}>
              <td>{r.serial}</td><td>{r.model}</td><td>{r.sap}</td>
              <td>
                <select value={r.status} onChange={(e) => persist(rows.map((x) => (x.id === r.id ? { ...x, status: e.target.value as InventoryStatus } : x)))}>
                  {statuses.map((s) => <option key={s} value={s}>{labels[s]}</option>)}
                </select>
              </td>
              <td>{r.assignedTo}</td><td>{r.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
