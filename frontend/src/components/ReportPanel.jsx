export default function ReportPanel({ summary, onGenerateReport, busy }) {
  return (
    <section className="glass-card report-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Reports & Export</p>
          <h2>Parking Reports</h2>
        </div>
      </div>

      <div className="report-summary">
        <div className="report-stat">
          <span>Total Slots</span>
          <strong>{summary?.totalSlots ?? 0}</strong>
        </div>

        <div className="report-stat">
          <span>Available</span>
          <strong>{summary?.availableSlots ?? 0}</strong>
        </div>

        <div className="report-stat">
          <span>Occupied</span>
          <strong>{summary?.occupiedSlots ?? 0}</strong>
        </div>
      </div>

      <div className="report-actions">
        <button onClick={() => onGenerateReport('daily')} disabled={busy}>
          Daily Report
        </button>
        <button onClick={() => onGenerateReport('occupancy')} disabled={busy}>
          Occupancy Report
        </button>
        <button onClick={() => onGenerateReport('activity')} disabled={busy}>
          Activity Report
        </button>
      </div>
    </section>
  );
}