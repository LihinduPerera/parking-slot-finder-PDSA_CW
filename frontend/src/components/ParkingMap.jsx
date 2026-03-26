function getNodeVisual(slotStatus, node) {
  if (node.type !== 'slot') {
    return 'node-junction';
  }

  if (slotStatus?.status === 'occupied') {
    return 'node-occupied';
  }

  return 'node-available';
}

const routeClasses = ['route-primary', 'route-secondary', 'route-tertiary'];

export default function ParkingMap({ map, slots, recommendation }) {
  const slotLookup = Object.fromEntries(slots.map((slot) => [slot.id, slot]));
  const highlightedEdges = new Map();
  const allPaths = recommendation?.alternatives?.map((item) => item.path) || [];

  allPaths.forEach((path, routeIndex) => {
    for (let index = 0; index < path.length - 1; index += 1) {
      const a = path[index];
      const b = path[index + 1];
      highlightedEdges.set(`${a}-${b}`, routeClasses[routeIndex] || routeClasses[0]);
      highlightedEdges.set(`${b}-${a}`, routeClasses[routeIndex] || routeClasses[0]);
    }
  });

  return (
    <section className="glass-card map-card">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Visual parking layout</p>
          <h2>Graph map simulation - Level {map.level}</h2>
        </div>
        <div className="legend-row">
          <span><i className="legend-dot legend-green" />Available</span>
          <span><i className="legend-dot legend-red" />Occupied</span>
          <span><i className="legend-dot legend-blue" />Route 1</span>
          <span><i className="legend-dot legend-orange" />Route 2</span>
          <span><i className="legend-dot legend-cyan" />Route 3</span>
        </div>
      </div>

      <svg viewBox="0 0 840 520" className="parking-map">
        {map.edges.map((edge) => {
          const from = map.nodes[edge.from];
          const to = map.nodes[edge.to];
          const routeClass = highlightedEdges.get(`${edge.from}-${edge.to}`);

          return (
            <g key={`${edge.from}-${edge.to}`}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                className={routeClass ? `map-edge active-edge ${routeClass}` : 'map-edge'}
              />
              <text
                x={(from.x + to.x) / 2}
                y={(from.y + to.y) / 2 - 8}
                className="edge-weight"
              >
                {edge.weight}
              </text>
            </g>
          );
        })}

        {Object.values(map.nodes).map((node) => {
          const slotStatus = slotLookup[node.id];
          const nodeClass = getNodeVisual(slotStatus, node);
          const isRecommended = recommendation?.slotId === node.id;

          return (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={isRecommended ? 26 : 22}
                className={`map-node ${nodeClass} ${isRecommended ? 'node-recommended' : ''}`}
              />
              <text x={node.x} y={node.y + 5} textAnchor="middle" className="node-id">
                {node.id}
              </text>
              <text x={node.x} y={node.y + 42} textAnchor="middle" className="node-label">
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </section>
  );
}
