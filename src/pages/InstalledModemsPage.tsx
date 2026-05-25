import { useEffect, useMemo, useState } from 'react';
import { initialInventoryRows, InventoryRow, InventoryStatus } from '../data';
import { buildCsv, downloadCsv } from '../utils/csv';
import { loadTable, saveTable } from '../lib/repo';

const labels: Record<InventoryStatus, string> = { da_assegnare: 'Da assegnare', assegnato: 'Assegnato', installato: 'Installato', da_riconsegnare: 'Da riconsegnare', riconsegnato: 'Riconsegnato', denunciato: 'Denunciato' };
const statuses: InventoryStatus[] = ['da_assegnare', 'assegnato', 'installato', 'da_riconsegnare', 'riconsegnato', 'denunciato'];

export function InstalledModemsPage() {
  const [rows, setRows] = useState<InventoryRow[]>(initialInventoryRows);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => { (async () => { setRows(await loadTable('inventory_rows','inventory_rows',initialInventoryRows)); })(); }, []);

  const persist = (next: InventoryRow[]) => {
    setRows(next);
    void saveTable('inventory_rows','inventory_rows', next);
  };

  const filtered = useMemo(
    () =>
      rows
        .filter((r) => r.status === 'installato')
        .filter(
          (r) =>
            (!search || [r.serial, r.model, r.sap, r.assignedTo, r.provenance, r.notes].join(' ').toLowerCase().includes(search.toLowerCase())) &&
            (!fromDate || r.createdAt >= fromDate) &&
            (!toDate || r.createdAt <= toDate)
        ),
    [rows, search, fromDate, toDate]
  );

  const exp = () => {
    const csv = buildCsv(['seriale','modello','sap','stato','tecnico','provenienza','note','data'], filtered.map((r) => [r.serial, r.model, r.sap, labels[r.status], r.assignedTo, r.provenance, r.notes, r.createdAt]));
    downloadCsv(csv, 'installati.csv');
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
      <div className="table-wrap"><table className="compact-table with-separators data-wide-table">
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
              <td>{r.assignedTo}</td><td>{r.provenance}</td><td>{r.notes}</td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </section>
  );
}
