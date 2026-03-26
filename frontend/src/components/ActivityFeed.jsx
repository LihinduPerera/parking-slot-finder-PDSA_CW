export default function ActivityFeed({ history }) {
  return (
    <section className="glass-card activity-card">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Activity log</p>
          <h2>Recent system events</h2>
        </div>
      </div>

      <div className="activity-list">
        {history.map((item) => (
          <article className="activity-item" key={item.id}>
            <div>
              <strong>{item.action}</strong>
              <p>{item.details}</p>
            </div>
            <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
