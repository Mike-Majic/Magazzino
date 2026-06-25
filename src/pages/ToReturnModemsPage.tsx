import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { initialInventoryRows, InventoryRow, InventoryStatus, seededUsers, UserRow } from '../data';
import { buildCsv, downloadCsv } from '../utils/csv';
import { loadTable, saveTable } from '../lib/repo';
import { inventoryStatusLabels, inventoryStatuses } from '../constants/inventory';




export function ToReturnModemsPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<InventoryRow[]>(initialInventoryRows);
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get('status');
  const isReturnedView = statusParam === 'riconsegnato';
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentUser, setCurrentUser] = useState<UserRow | null>(null);

  useEffect(() => { (async () => {
    setRows(await loadTable('inventory_rows','inventory_rows',initialInventoryRows));
    const users = await loadTable('users_registry','users_registry',seededUsers);
    const sid = Number(localStorage.getItem('session_user_id') || 0);
    setCurrentUser(users.find((u) => u.id === sid) ?? null);
  })(); }, []);

  const persist = (next: InventoryRow[]) => {
    setRows(next);
    void saveTable('inventory_rows','inventory_rows', next);
  };

  const isTechnician = currentUser?.jobRole === 'Tecnico' || currentUser?.role === 'Tecnico';
  const currentUserFullName = `${currentUser?.firstName ?? ''} ${currentUser?.lastName ?? ''}`.trim();

  const filtered = useMemo(
    () =>
      rows
        .filter((r) => isReturnedView ? r.status === 'riconsegnato' : r.status === 'da_riconsegnare')
        .filter((r) => !isTechnician || (currentUserFullName && r.assignedTo === currentUserFullName))
        .filter(
          (r) =>
            (!search || [r.serial, r.model, r.sap, r.assignedTo, r.provenance, r.notes].join(' ').toLowerCase().includes(search.toLowerCase())) &&
            (!fromDate || r.createdAt >= fromDate) &&
            (!toDate || r.createdAt <= toDate)
        ),
    [rows, search, fromDate, toDate, isReturnedView, isTechnician, currentUserFullName]
  );

  const exp = () => {
    const csv = buildCsv(['seriale','modello','sap','stato','tecnico','provenienza','note','data'], filtered.map((r) => [r.serial, r.model, r.sap, inventoryStatusLabels[r.status], r.assignedTo, r.provenance, r.notes, r.createdAt]));
    downloadCsv(csv, isReturnedView ? 'riconsegnati.csv' : 'da_riconsegnare.csv');
  };

  return (
    <section>
      <div className="section-header"><h2>{isReturnedView ? 'Materiale riconsegnato' : 'Materiali da riconsegnare'}</h2><p>{filtered.length} materiali trovati</p></div>
      <div className="status-switch" aria-label="Vista riconsegne"><button type="button" className={!isReturnedView ? 'active' : ''} onClick={() => navigate('/to-return')}>Da riconsegnare</button><button type="button" className={isReturnedView ? 'active' : ''} onClick={() => navigate('/to-return?status=riconsegnato')}>Riconsegnato</button></div>
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
          {filtered.length === 0 && <tr><td colSpan={6} className="empty-state">Nessun materiale trovato per questa vista. Prova a cambiare filtri o stato.</td></tr>}
          {filtered.map((r) => (
            <tr key={r.id}>
              <td>{r.serial}</td><td>{r.model}</td><td>{r.sap}</td>
              <td>
                <select value={r.status} onChange={(e) => persist(rows.map((x) => (x.id === r.id ? { ...x, status: e.target.value as InventoryStatus } : x)))}>
                  {inventoryStatuses.map((s) => <option key={s} value={s}>{inventoryStatusLabels[s]}</option>)}
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