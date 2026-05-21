import { useEffect, useMemo, useState } from 'react';
import { MovementRow } from '../data';

export function MovementsPage() {
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<MovementRow[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('movements_log');
    if (!stored) return;
    try {
      setRows(JSON.parse(stored));
    } catch {
      setRows([]);
    }
  }, []);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (!keyword) return true;
      return [row.date, row.time, row.user, row.serial, row.action, row.technician, row.notes, row.attachmentName ?? '']
        .join(' ')
        .toLowerCase()
        .includes(keyword);
    });
  }, [search, rows]);

  return (
    <section>
      <h2>Storico movimenti</h2>
      <input className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cerca in tutti i movimenti" />
      <table className="compact-table with-separators">
        <thead>
          <tr>
            <th>Data</th>
            <th>Ora</th>
            <th>Utente</th>
            <th>Seriale</th>
            <th>Azione</th>
            <th>Tecnico</th>
            <th>Note</th>
            <th>Allegati</th>
          </tr>
        </thead>
        <tbody>
          {filteredRows.map((row) => (
            <tr key={row.id}>
              <td>{row.date}</td>
              <td>{row.time}</td>
              <td>{row.user}</td>
              <td>{row.serial}</td>
              <td>{row.action}</td>
              <td>{row.technician}</td>
              <td>{row.notes}</td>
              <td>{row.attachmentName ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
