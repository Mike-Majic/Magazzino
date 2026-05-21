import { useMemo, useState } from 'react';
import { movementRows } from '../data';

export function MovementsPage() {
  const [search, setSearch] = useState('');

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return movementRows.filter((row) => {
      if (!keyword) return true;
      return [row.date, row.user, row.serial, row.from, row.to, row.technician, row.notes].join(' ').toLowerCase().includes(keyword);
    });
  }, [search]);

  return (
    <section>
      <h2>Storico movimenti</h2>
      <input
        className="search-input"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Cerca in tutti i movimenti"
      />
      <table className="compact-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Utente</th>
            <th>Seriale</th>
            <th>Da stato</th>
            <th>A stato</th>
            <th>Tecnico</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {filteredRows.map((row, index) => (
            <tr key={`${row.serial}-${index}`}>
              <td>{row.date}</td>
              <td>{row.user}</td>
              <td>{row.serial}</td>
              <td>{row.from}</td>
              <td>{row.to}</td>
              <td>{row.technician}</td>
              <td>{row.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
