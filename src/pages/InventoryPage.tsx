import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { inventoryRows } from '../data';

const initialWidths = [220, 180, 90, 110, 120, 220];

export function InventoryPage() {
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status');
  const [colWidths, setColWidths] = useState<number[]>(initialWidths);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return inventoryRows.filter((row) => {
      const matchesStatus = statusFilter ? row.status === statusFilter : true;
      if (!matchesStatus) return false;
      if (!keyword) return true;

      return [row.serial, row.model, row.sap, row.status, row.assignedTo, row.notes].join(' ').toLowerCase().includes(keyword);
    });
  }, [search, statusFilter]);

  const startResize = (index: number, startX: number) => {
    const startWidth = colWidths[index];

    const onMove = (event: MouseEvent) => {
      const delta = event.clientX - startX;
      setColWidths((prev) => prev.map((w, i) => (i === index ? Math.max(70, startWidth + delta) : w)));
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <section>
      <h2>Seriali modem</h2>

      <div className="new-modem-form">
        <input placeholder="Seriale" />
        <input placeholder="Modello" />
        <input placeholder="SAP" />
        <select defaultValue="giacente">
          <option value="giacente">giacente</option>
          <option value="assegnato">assegnato</option>
          <option value="installato">installato</option>
          <option value="da_riconsegnare">da_riconsegnare</option>
          <option value="riconsegnato">riconsegnato</option>
          <option value="guasto">guasto</option>
          <option value="scaricato">scaricato</option>
        </select>
        <input placeholder="Assegnato a" />
        <input placeholder="Note" />
        <button type="button">Registra modem</button>
      </div>

      <input
        className="search-input"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Cerca per seriale, modello, SAP, stato, assegnato o note"
      />
      <div className="table-wrap">
        <table className="compact-table with-separators">
          <colgroup>
            {colWidths.map((w, i) => (
              <col key={i} style={{ width: `${w}px` }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {['Seriale', 'Modello', 'SAP', 'Stato', 'Assegnato a', 'Note'].map((header, index) => (
                <th key={header}>
                  <span>{header}</span>
                  <span className="resize-handle" onMouseDown={(e) => startResize(index, e.clientX)} title="Ridimensiona colonna" />
                </th>
              ))}
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
      </div>
    </section>
  );
}
