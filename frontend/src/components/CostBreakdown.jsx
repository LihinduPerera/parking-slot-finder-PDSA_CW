export default function CostBreakdown({ recommendation }) {
  if (!recommendation) {
    return null;
  }

  const breakdown = recommendation.estimatedCostBreakdown || {
    baseRate: 0,
    perHour: 0,
    billedHours: 0,
    usage: 0
  };

  return (
    <div className="cost-breakdown">
      <span>Cost estimate breakdown</span>
      <div className="cost-row">
        <small>Estimated duration</small>
        <strong>{recommendation.estimatedDurationMinutes} min</strong>
      </div>
      <div className="cost-row">
        <small>Base amount</small>
        <strong>LKR {breakdown.baseRate}</strong>
      </div>
      <div className="cost-row">
        <small>Usage ({breakdown.billedHours} h x {breakdown.perHour})</small>
        <strong>LKR {breakdown.usage}</strong>
      </div>
      <div className="cost-row total">
        <small>Total estimate</small>
        <strong>LKR {recommendation.estimatedCost}</strong>
      </div>
    </div>
  );
}
