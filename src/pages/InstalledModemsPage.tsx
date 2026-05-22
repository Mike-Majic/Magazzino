import { useEffect, useState } from 'react';
import { initialInventoryRows, InventoryRow } from '../data';

export function InstalledModemsPage() {
  const [rows, setRows] = useState<InventoryRow[]>(initialInventoryRows);

  useEffect(() => {
    const stored = localStorage.getItem('inventory_rows');
    if (stored) setRows(JSON.parse(stored));
  }, []);

  const installed = rows.filter((row) => row.status === 'installato');

  return (
    <section>
      <h2>Modem installati</h2>
      <table className="compact-table with-separators">
        <thead>
          <tr>
            <th>Seriale</th>
            <th>Modello</th>
            <th>SAP</th>
            <th>Tecnico</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {installed.map((row) => (
            <tr key={row.id}>
              <td>{row.serial}</td>
              <td>{row.model}</td>
              <td>{row.sap}</td>
              <td>{row.assignedTo}</td>
              <td>{row.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
