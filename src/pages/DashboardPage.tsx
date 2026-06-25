import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initialInventoryRows, InventoryRow } from '../data';
import { loadTable } from '../lib/repo';

import { inventoryStatusLabels, inventoryStatusRoutes, inventoryStatuses } from '../constants/inventory';

export function DashboardPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<InventoryRow[]>(initialInventoryRows);

  useEffect(() => { (async () => { setRows(await loadTable('inventory_rows','inventory_rows',initialInventoryRows)); })(); }, []);

  const cards = useMemo(
    () =>
      (inventoryStatuses).map((status) => ({
        status,
        title: inventoryStatusLabels[status],
        value: rows.filter((row) => row.status === status).length
      })),
    [rows]
  );

  return (
    <section>
      <div className="dashboard-header"><h2>Dashboard operativa</h2></div>
      <div className="grid-cards modern-grid">
        {cards.map((card) => (
          <button key={card.status} className="card card-button modern-card" onClick={() => navigate(inventoryStatusRoutes[card.status])}>
            <small className="card-title">{card.title}</small><span>{card.value}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
