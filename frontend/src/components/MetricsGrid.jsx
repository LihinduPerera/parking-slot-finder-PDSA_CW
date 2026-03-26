const metricCards = [
  { key: 'totalSlots', label: 'Total Slots' },
  { key: 'availableSlots', label: 'Available Slots' },
  { key: 'occupiedSlots', label: 'Occupied Slots' },
  { key: 'occupancyRate', label: 'Occupancy Rate', suffix: '%' },
  { key: 'premiumSlotsAvailable', label: 'Premium Available' }
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
        <p>Allocation and Revenue</p>
        <div className="mini-stats">
          <span>Cars: {summary.carSlotsAvailable}</span>
          <span>Bikes: {summary.bikeSlotsAvailable}</span>
          <span>EV Slots: {summary.evSlotsAvailable}</span>
          <span>Revenue: LKR {summary.totalRevenue}</span>
        </div>
      </article>
    </section>
  );
}
