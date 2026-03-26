export default function SlotTable({ slots, onSetOccupied, onSetAvailable, onRelease, busy }) {
  return (
    <section className="glass-card table-card">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Admin control</p>
          <h2>Live slot management</h2>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Slot</th>
              <th>Type</th>
              <th>Status</th>
              <th>Current Vehicle</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((slot) => (
              <tr key={slot.id}>
                <td>{slot.label}</td>
                <td>{slot.type.toUpperCase()}</td>
                <td>
                  <span className={`table-status ${slot.status === 'available' ? 'status-available' : 'status-occupied'}`}>
                    {slot.status}
                  </span>
                </td>
                <td>{slot.currentVehicle || '—'}</td>
                <td className="action-row">
                  {slot.status === 'available' ? (
                    <button className="small-button" disabled={busy} onClick={() => onSetOccupied(slot.id)}>
                      Mark Occupied
                    </button>
                  ) : (
                    <>
                      <button className="small-button" disabled={busy} onClick={() => onRelease(slot.id)}>
                        Release
                      </button>
                      <button className="small-button secondary" disabled={busy} onClick={() => onSetAvailable(slot.id)}>
                        Force Available
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
