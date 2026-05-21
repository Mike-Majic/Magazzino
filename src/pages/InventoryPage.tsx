import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { inventoryRows } from '../data';

export function InventoryPage() {
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status');

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return inventoryRows.filter((row) => {
      const matchesStatus = statusFilter ? row.status === statusFilter : true;
      if (!matchesStatus) return false;
      if (!keyword) return true;

      return [row.serial, row.model, row.sap, row.status, row.assignedTo, row.notes].join(' ').toLowerCase().includes(keyword);
    });
  }, [search, statusFilter]);

  return (
    <section>
      <h2>Seriali modem</h2>
      <input
        className="search-input"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Cerca per seriale, modello, SAP, stato, assegnato o note"
      />
      <table className="compact-table">
        <thead>
          <tr>
            <th>Seriale</th>
            <th>Modello</th>
            <th>SAP</th>
            <th>Stato</th>
            <th>Assegnato a</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {filteredRows.map((row) => (
            <tr key={row.serial}>
              <td>{row.serial}</td>
              <td>{row.model}</td>
              <td>{row.sap}</td>
              <td>{row.status}</td>
              <td>{row.assignedTo}</td>
              <td>{row.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
