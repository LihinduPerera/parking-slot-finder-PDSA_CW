import { useState } from 'react';

export default function DriverPanel({ entrances, vehicleTypes, levels, slotCategories, onRecommend, busy }) {
  const [form, setForm] = useState({
    vehicleNumber: '',
    vehicleType: vehicleTypes[0] || 'car',
    entranceId: entrances[0]?.id || 'L1_E1',
    preferredLevel: levels?.[0]?.level || 1,
    preferredCategory: 'any',
    estimatedDurationMinutes: 120
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onRecommend(form);
  };

  return (
    <section className="glass-card panel-card">
      <div className="panel-header">
        <p className="eyebrow">Driver input</p>
        <h2>Find the best slot</h2>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Vehicle Number
          <input
            type="text"
            placeholder="CAR-1245"
            value={form.vehicleNumber}
            onChange={(event) => setForm((current) => ({ ...current, vehicleNumber: event.target.value.toUpperCase() }))}
            required
          />
        </label>

        <label>
          Vehicle Type
          <select
            value={form.vehicleType}
            onChange={(event) => setForm((current) => ({ ...current, vehicleType: event.target.value }))}
          >
            {vehicleTypes.map((type) => (
              <option key={type} value={type}>
                {type.toUpperCase()}
              </option>
            ))}
          </select>
        </label>

        <label>
          Entrance
          <select
            value={form.entranceId}
            onChange={(event) => setForm((current) => ({ ...current, entranceId: event.target.value }))}
          >
            {entrances.map((entrance) => (
              <option key={entrance.id} value={entrance.id}>
                {entrance.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Preferred Level
          <select
            value={form.preferredLevel}
            onChange={(event) => setForm((current) => ({ ...current, preferredLevel: Number(event.target.value) }))}
          >
            {levels.map((level) => (
              <option key={level.level} value={level.level}>
                Level {level.level}
              </option>
            ))}
          </select>
        </label>

        <label>
          Slot Category Preference
          <select
            value={form.preferredCategory}
            onChange={(event) => setForm((current) => ({ ...current, preferredCategory: event.target.value }))}
          >
            <option value="any">Any Category</option>
            {slotCategories.map((category) => (
              <option key={category} value={category}>
                {category.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </label>

        <label>
          Estimated Parking Duration (minutes)
          <input
            type="number"
            min="15"
            step="15"
            value={form.estimatedDurationMinutes}
            onChange={(event) => setForm((current) => ({ ...current, estimatedDurationMinutes: Number(event.target.value) || 60 }))}
          />
        </label>

        <button className="primary-button" type="submit" disabled={busy}>
          {busy ? 'Processing...' : 'Recommend Nearest Slot'}
        </button>
      </form>

      <div className="feature-list">
        <div>
          <span>01</span>
          Graph-based slot routing
        </div>
        <div>
          <span>02</span>
          Shortest path navigation
        </div>
        <div>
          <span>03</span>
          Live occupancy and cost dashboard
        </div>
      </div>
    </section>
  );
}
