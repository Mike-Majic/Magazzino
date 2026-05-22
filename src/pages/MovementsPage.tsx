import { useEffect, useMemo, useState } from 'react';
import { MovementRow } from '../data';

export function MovementsPage() {
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<MovementRow[]>([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('movements_log');
    if (stored) setRows(JSON.parse(stored));
  }, []);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesKeyword = !keyword || [row.date, row.time, row.user, row.serial, row.action, row.technician, row.notes, row.attachmentName ?? ''].join(' ').toLowerCase().includes(keyword);
      const iso = row.date.split('/').reverse().join('-');
      const matchesFrom = !fromDate || iso >= fromDate;
      const matchesTo = !toDate || iso <= toDate;
      return matchesKeyword && matchesFrom && matchesTo;
    });
  }, [search, rows, fromDate, toDate]);

  return (
    <section>
      <h2>Storico movimenti</h2>
      <div className="filters-row modern-filters">
        <input className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cerca in tutti i movimenti" />
        <input type="date" className="modern-input" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
        <input type="date" className="modern-input" value={toDate} onChange={(event) => setToDate(event.target.value)} />
        <button type="button" className="modern-export-btn" onClick={() => { const csv = 'data,ora,utente,seriale,azione,tecnico,note\n' + filteredRows.map(r => `${r.date},${r.time},${r.user},${r.serial},${r.action},${r.technician},${r.notes}`).join('\n'); const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download='movimenti.csv'; a.click(); }}>Export Excel/CSV</button>
              <button type="button" className="icon-btn danger" title="Reset log" onClick={() => { if (window.confirm('Resettare tutti i movimenti?')) { setRows([]); localStorage.removeItem('movements_log'); } }}>🧹 Reset log</button>
      </div>
      <table className="compact-table with-separators">
        <thead>
          <tr><th>Data</th><th>Ora</th><th>Utente</th><th>Seriale</th><th>Azione</th><th>Tecnico</th><th>Note</th><th>Allegato</th></tr>
        </thead>
        <tbody>
          {filteredRows.map((row) => (
            <tr key={row.id}>
              <td>{row.date}</td><td>{row.time}</td><td>{row.user}</td><td>{row.serial}</td><td>{row.action}</td><td>{row.technician}</td><td>{row.notes}</td>
              <td className="attachment-cell">{row.attachmentUrl ? <button type="button" className="icon-btn" onClick={() => window.open(row.attachmentUrl, '_blank')}>👁️</button> : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
