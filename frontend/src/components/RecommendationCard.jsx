export default function RecommendationCard({ recommendation, onConfirm, busy }) {
  if (!recommendation) {
    return (
      <section className="glass-card panel-card recommendation-empty">
        <p className="eyebrow">Output</p>
        <h2>Recommendation result</h2>
        <p>
          Submit a vehicle number, select the vehicle type, and choose an entrance to generate the nearest-slot recommendation.
        </p>
      </section>
    );
  }

  return (
    <section className="glass-card panel-card recommendation-card">
      <div className="recommendation-top">
        <div>
          <p className="eyebrow">System output</p>
          <h2>{recommendation.slotLabel}</h2>
          <p>{recommendation.message}</p>
        </div>
        <div className="slot-badge">{recommendation.vehicleType.toUpperCase()}</div>
      </div>

      <div className="recommendation-grid">
        <div>
          <span>Vehicle</span>
          <strong>{recommendation.vehicleNumber}</strong>
        </div>
        <div>
          <span>Entrance</span>
          <strong>{recommendation.entranceId}</strong>
        </div>
        <div>
          <span>Distance</span>
          <strong>{recommendation.distance} units</strong>
        </div>
        <div>
          <span>ETA</span>
          <strong>{recommendation.estimatedTimeMinutes} min</strong>
        </div>
      </div>

      <div className="path-card">
        <span>Shortest path</span>
        <strong>{recommendation.path.join(' → ')}</strong>
      </div>

      <button
        className="primary-button"
        onClick={onConfirm}
        disabled={busy || recommendation.confirmed}
      >
        {recommendation.confirmed ? 'Slot Confirmed' : 'Confirm Parking Assignment'}
      </button>
    </section>
  );
}
