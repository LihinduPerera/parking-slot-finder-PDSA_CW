function getNodeVisual(slotStatus, node) {
  if (node.type !== 'slot') {
    return 'node-junction';
  }

  if (slotStatus?.status === 'occupied') {
    return 'node-occupied';
  }

  return 'node-available';
}

export default function ParkingMap({ map, slots, recommendedPath, recommendation }) {
  const slotLookup = Object.fromEntries(slots.map((slot) => [slot.id, slot]));
  const highlightedEdges = new Set();

  for (let index = 0; index < recommendedPath.length - 1; index += 1) {
    const a = recommendedPath[index];
    const b = recommendedPath[index + 1];
    highlightedEdges.add(`${a}-${b}`);
    highlightedEdges.add(`${b}-${a}`);
  }

  return (
    <section className="glass-card map-card">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Visual parking layout</p>
          <h2>Graph map simulation</h2>
        </div>
        <div className="legend-row">
          <span><i className="legend-dot legend-green" />Available</span>
          <span><i className="legend-dot legend-red" />Occupied</span>
          <span><i className="legend-dot legend-blue" />Shortest path</span>
        </div>
      </div>

      <svg viewBox="0 0 840 520" className="parking-map">
        {map.edges.map((edge) => {
          const from = map.nodes[edge.from];
          const to = map.nodes[edge.to];
          const isHighlighted = highlightedEdges.has(`${edge.from}-${edge.to}`);

          return (
            <g key={`${edge.from}-${edge.to}`}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                className={isHighlighted ? 'map-edge active-edge' : 'map-edge'}
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
