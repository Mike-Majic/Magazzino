import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { initialInventoryRows } from '../data';

const statusLabels: Record<string, string> = {
  giacente: 'Giacenti',
  assegnato: 'Assegnati',
  installato: 'Installati',
  da_riconsegnare: 'Da riconsegnare',
  riconsegnato: 'Riconsegnati',
  guasto: 'Guasti',
  scaricato: 'Scaricati'
};

export function DashboardPage() {
  const navigate = useNavigate();
  const cards = useMemo(() => Object.entries(statusLabels).map(([status, label]) => ({ status, title: label, value: initialInventoryRows.filter((row) => row.status === status).length })), []);
  const total = initialInventoryRows.length;

  return (
    <section>
      <div className="dashboard-header">
        <div>
          <h2>Dashboard operativa</h2>
          <p>Panoramica rapida magazzino e installazioni.</p>
        </div>
        <div className="kpi-chip">Totale modem: <strong>{total}</strong></div>
      </div>
      <div className="grid-cards modern-grid">
        {cards.map((card) => (
          <button key={card.status} className="card card-button modern-card" onClick={() => navigate(`/inventory?status=${card.status}`)}>
            <small>{card.title}</small>
            <span>{card.value}</span>
            <em>Apri elenco</em>
          </button>
        ))}
      </div>
    </section>
  );
}
