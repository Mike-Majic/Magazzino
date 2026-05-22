import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { initialInventoryRows } from '../data';

const statusLabels = {
  da_assegnare: 'Da assegnare',
  assegnato: 'Assegnato',
  installato: 'Installato',
  da_riconsegnare: 'Da riconsegnare',
  riconsegnato: 'Riconsegnato',
  denunciato: 'Denunciato'
};

export function DashboardPage() {
  const navigate = useNavigate();
  const cards = useMemo(
    () => Object.entries(statusLabels).map(([status, label]) => ({ status, title: label, value: initialInventoryRows.filter((row) => row.status === status).length })),
    []
  );
  return (
    <section>
      <div className="dashboard-header"><h2>Dashboard operativa</h2></div>
      <div className="grid-cards modern-grid">
        {cards.map((card) => (
          <button key={card.status} className="card card-button modern-card" onClick={() => navigate(`/inventory?status=${card.status}`)}>
            <small>{card.title}</small><span>{card.value}</span><em>Apri elenco</em>
          </button>
        ))}
      </div>
    </section>
  );
}
