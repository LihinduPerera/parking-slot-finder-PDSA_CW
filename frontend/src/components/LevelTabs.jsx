export default function LevelTabs({ levels, selectedLevel, onSelectLevel }) {
  return (
    <section className="glass-card level-tabs-card">
      <div className="panel-header compact">
        <div>
          <p className="eyebrow">Multi-level filter</p>
          <h2>Parking levels</h2>
        </div>
      </div>

      <div className="level-tabs">
        {levels.map((entry) => (
          <button
            key={entry.level}
            type="button"
            className={selectedLevel === entry.level ? 'level-tab active' : 'level-tab'}
            onClick={() => onSelectLevel(entry.level)}
          >
            <strong>Level {entry.level}</strong>
            <small>{entry.available}/{entry.total} available</small>
          </button>
        ))}
      </div>
    </section>
  );
}
