const metricCards = [
  { key: 'totalSlots', label: 'Total Slots' },
  { key: 'availableSlots', label: 'Available Slots' },
  { key: 'occupiedSlots', label: 'Occupied Slots' },
  { key: 'occupancyRate', label: 'Occupancy Rate', suffix: '%' }
];

export default function MetricsGrid({ summary }) {
  return (
    <section className="metrics-grid">
      {metricCards.map((card) => (
        <article className="metric-card glass-card" key={card.key}>
          <p>{card.label}</p>
          <h3>
            {summary[card.key]}
            {card.suffix || ''}
          </h3>
        </article>
      ))}
      <article className="metric-card glass-card accent-card">
        <p>Vehicle Allocation Mix</p>
        <div className="mini-stats">
          <span>Cars: {summary.carSlotsAvailable}</span>
          <span>Bikes: {summary.bikeSlotsAvailable}</span>
        </div>
      </article>
    </section>
  );
}
