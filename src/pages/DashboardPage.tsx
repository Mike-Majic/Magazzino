import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryRows } from '../data';

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

  const cards = useMemo(() => {
    return Object.entries(statusLabels).map(([status, label]) => ({
      status,
      title: label,
      value: inventoryRows.filter((row) => row.status === status).length
    }));
  }, []);

  return (
    <section>
      <h2>Dashboard operativa</h2>
      <div className="grid-cards">
        {cards.map((card) => (
          <button key={card.status} className="card card-button" onClick={() => navigate(`/inventory?status=${card.status}`)}>
            <strong>{card.title}</strong>
            <span>{card.value}</span>
            <small>Clicca per aprire i dettagli</small>
          </button>
        ))}
      </div>
    </section>
  );
}
