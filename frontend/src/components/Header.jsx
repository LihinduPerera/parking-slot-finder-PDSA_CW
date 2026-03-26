export default function Header({ onReset, busy }) {
  return (
    <header className="header glass-card">
      <div>
        <p className="eyebrow">PDSA Coursework Demo</p>
        <h1>Smart Parking Slot Finder</h1>
        <p className="header-copy">
          A graph-based parking allocation system with shortest-path navigation, live slot tracking, and modern admin controls.
        </p>
      </div>

      <div className="header-actions">
        <div className="status-pill">
          <span className="status-dot" />
          Live simulation
        </div>
        <button className="ghost-button" onClick={onReset} disabled={busy}>
          Reset Demo Data
        </button>
      </div>
    </header>
  );
}
