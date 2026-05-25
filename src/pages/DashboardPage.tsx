import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initialInventoryRows, InventoryRow, InventoryStatus } from '../data';
import { loadTable } from '../lib/repo';

const statusLabels: Record<InventoryStatus, string> = {
  da_assegnare: 'Da assegnare',
  assegnato: 'Assegnato',
  installato: 'Installato',
  da_riconsegnare: 'Da riconsegnare',
  riconsegnato: 'Riconsegnato',
  denunciato: 'Denunciato'
};

const statusRoutes: Record<InventoryStatus, string> = {
  da_assegnare: '/inventory?status=da_assegnare',
  assegnato: '/inventory?status=assegnato',
  installato: '/installed',
  da_riconsegnare: '/to-return',
  riconsegnato: '/to-return?status=riconsegnato',
  denunciato: '/reported'
};

export function DashboardPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<InventoryRow[]>(initialInventoryRows);

  useEffect(() => { (async () => { setRows(await loadTable('inventory_rows','inventory_rows',initialInventoryRows)); })(); }, []);

  const cards = useMemo(
    () =>
      (Object.keys(statusLabels) as InventoryStatus[]).map((status) => ({
        status,
        title: statusLabels[status],
        value: rows.filter((row) => row.status === status).length
      })),
    [rows]
  );

  return (
    <section>
      <div className="dashboard-header"><h2>Dashboard operativa</h2></div>
      <div className="grid-cards modern-grid">
        {cards.map((card) => (
          <button key={card.status} className="card card-button modern-card" onClick={() => navigate(statusRoutes[card.status])}>
            <small className="card-title">{card.title}</small><span>{card.value}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
