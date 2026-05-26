import { useEffect, useMemo, useState } from 'react';
import { MovementRow, seededUsers, UserRow } from '../data';
import { buildCsv, downloadCsv } from '../utils/csv';
import { loadTable, saveTable } from '../lib/repo';


export function MovementsPage() {
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<MovementRow[]>([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentUser, setCurrentUser] = useState<UserRow | null>(null);

  useEffect(() => { (async () => {
    setRows(await loadTable('movements_log','movements_log',[]));
    const users = await loadTable('users_registry','users_registry',seededUsers);
    const sid = Number(localStorage.getItem('session_user_id') || 0);
    setCurrentUser(users.find((u) => u.id === sid) ?? null);
  })(); }, []);

  const isTechnician = currentUser?.jobRole === 'Tecnico' || currentUser?.role === 'Tecnico';
  const currentUserFullName = `${currentUser?.firstName ?? ''} ${currentUser?.lastName ?? ''}`.trim();

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesKeyword = !keyword || [row.date, row.time, row.user, row.serial, row.action, row.technician, row.notes, row.attachmentName ?? ''].join(' ').toLowerCase().includes(keyword);
      const iso = row.date.split('/').reverse().join('-');
      const matchesFrom = !fromDate || iso >= fromDate;
      const matchesTo = !toDate || iso <= toDate;
      const matchesTechnician = !isTechnician || (currentUserFullName && row.technician === currentUserFullName);
      return matchesKeyword && matchesFrom && matchesTo && matchesTechnician;
    });
  }, [search, rows, fromDate, toDate, isTechnician, currentUserFullName]);

  return (
    <section>
      <h2>Storico movimenti</h2>
      <div className="filters-row modern-filters">
        <input className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cerca in tutti i movimenti" />
        <input type="date" className="modern-input" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
        <input type="date" className="modern-input" value={toDate} onChange={(event) => setToDate(event.target.value)} />
        <button type="button" className="modern-export-btn" onClick={() => { const csv = buildCsv(['data','ora','utente','seriale','sap','stato','provenienza','azione','tecnico','note'], filteredRows.map(r => [r.date, r.time, r.user, r.serial, r.sap, r.status, r.provenance, r.action, r.technician, r.notes])); downloadCsv(csv, 'movimenti.csv'); }}>Export Excel/CSV</button>
              <button type="button" className="icon-btn danger" title="Reset log" onClick={() => { if (window.confirm('Resettare tutti i movimenti?')) { setRows([]); void saveTable('movements_log','movements_log', []); } }}>🧹 Reset log</button>
      </div>
      <div className="table-wrap"><table className="compact-table with-separators movements-wide-table">
        <thead>
          <tr><th>Data</th><th>Ora</th><th>Utente</th><th>Seriale</th><th>SAP</th><th>Stato</th><th>Provenienza</th><th>Azione</th><th>Tecnico</th><th>Note</th><th>Allegato</th></tr>
        </thead>
        <tbody>
          {filteredRows.map((row) => (
            <tr key={row.id}>
              <td>{row.date}</td><td>{row.time}</td><td>{row.user}</td><td>{row.serial}</td><td>{row.sap}</td><td>{row.status}</td><td>{row.provenance}</td><td>{row.action}</td><td>{row.technician}</td><td>{row.notes}</td>
              <td className="attachment-cell">{row.attachmentUrl ? <button type="button" className="icon-btn" onClick={() => window.open(row.attachmentUrl, '_blank')}>👁️</button> : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </section>
  );
}