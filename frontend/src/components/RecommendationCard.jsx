import CostBreakdown from './CostBreakdown.jsx';

export default function RecommendationCard({ recommendation, onConfirm, onSelectAlternative, busy }) {
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
          {recommendation.note && <p className="recommendation-note">{recommendation.note}</p>}
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
          <span>Level</span>
          <strong>L{recommendation.level}</strong>
        </div>
        <div>
          <span>Category</span>
          <strong>{recommendation.category.replace('_', ' ')}</strong>
        </div>
        <div>
          <span>Distance</span>
          <strong>{recommendation.distance} units</strong>
        </div>
        <div>
          <span>ETA</span>
          <strong>{recommendation.estimatedTimeMinutes} min</strong>
        </div>
        <div>
          <span>Estimated Cost</span>
          <strong>LKR {recommendation.estimatedCost}</strong>
        </div>
      </div>

      <div className="path-card">
        <span>Shortest path</span>
        <strong>{recommendation.path.join(' → ')}</strong>
      </div>

      {recommendation.alternatives?.length > 1 && (
        <div className="alternatives-list">
          <span>Alternative slots</span>
          {recommendation.alternatives.map((option) => (
            <button
              key={option.slotId}
              className={`alt-option ${recommendation.slotId === option.slotId ? 'active' : ''}`}
              onClick={() => onSelectAlternative(option.slotId)}
              type="button"
              disabled={busy}
            >
              <strong>{option.slotLabel}</strong>
              <small>L{option.level} • {option.category.replace('_', ' ')} • {option.distance} units • LKR {option.estimatedCost}</small>
            </button>
          ))}
        </div>
      )}

      <CostBreakdown recommendation={recommendation} />

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
