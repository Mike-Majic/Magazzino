import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { initialInventoryRows, InventoryRow, InventoryStatus } from '../data';
import { buildCsv, downloadCsv } from '../utils/csv';


const labels: Record<InventoryStatus, string> = { da_assegnare: 'Da assegnare', assegnato: 'Assegnato', installato: 'Installato', da_riconsegnare: 'Da riconsegnare', riconsegnato: 'Riconsegnato', denunciato: 'Denunciato' };
const statuses: InventoryStatus[] = ['da_assegnare', 'assegnato', 'installato', 'da_riconsegnare', 'riconsegnato', 'denunciato'];

export function ToReturnModemsPage() {
  const [rows, setRows] = useState<InventoryRow[]>(initialInventoryRows);
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get('status');
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
        .filter((r) => statusParam === 'riconsegnato' ? r.status === 'riconsegnato' : r.status === 'da_riconsegnare')
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
    downloadCsv(csv, statusParam === 'riconsegnato' ? 'riconsegnati.csv' : 'da_riconsegnare.csv');
  };

  return (
    <section>
      <h2>{statusParam === 'riconsegnato' ? 'Materiali riconsegnati' : 'Materiali da riconsegnare'}</h2>
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
              <td>{r.assignedTo}</td><td>{r.provenance}</td><td>{r.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}