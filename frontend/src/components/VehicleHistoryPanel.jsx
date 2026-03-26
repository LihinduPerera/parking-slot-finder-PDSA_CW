import { useState } from 'react';

export default function VehicleHistoryPanel({ onSearch, history, busy }) {
  const [vehicleNumber, setVehicleNumber] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!vehicleNumber.trim()) {
      return;
    }
    await onSearch(vehicleNumber.trim().toUpperCase());
  };

  return (
    <section className="glass-card activity-card">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Vehicle tracker</p>
          <h2>History and billing log</h2>
        </div>
      </div>

      <form className="history-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter vehicle number"
          value={vehicleNumber}
          onChange={(event) => setVehicleNumber(event.target.value.toUpperCase())}
        />
        <button className="small-button" type="submit" disabled={busy}>
          Search
        </button>
      </form>

      <div className="history-list">
        {history.length === 0 ? (
          <p className="muted">No history yet for the selected vehicle.</p>
        ) : (
          history.map((entry) => (
            <article className="history-item" key={entry.id}>
              <div>
                <strong>{entry.slotLabel}</strong>
                <p>
                  L{entry.level} • {entry.category.replace('_', ' ')} • {entry.parkedMinutes} min
                </p>
              </div>
              <span>LKR {entry.totalCost}</span>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
