import { DashboardCard } from '../types';

const cards: DashboardCard[] = [
  { title: 'Giacenti', value: 128, subtitle: 'Disponibili in magazzino' },
  { title: 'Installati', value: 326, subtitle: 'Consegnati a clienti' },
  { title: 'Da riconsegnare', value: 41, subtitle: 'In attesa di rientro' },
  { title: 'Guasti', value: 6, subtitle: 'Da scaricare o sostituire' }
];

export function DashboardPage() {
  return (
    <section>
      <h2>Dashboard operativa</h2>
      <div className="grid-cards">
        {cards.map((card) => (
          <article key={card.title} className="card">
            <strong>{card.title}</strong>
            <span>{card.value}</span>
            <small>{card.subtitle}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
