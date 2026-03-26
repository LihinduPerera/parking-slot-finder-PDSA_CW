export function createAdjacencyList(map) {
  const adjacencyList = {};

  Object.keys(map.nodes).forEach((nodeId) => {
    adjacencyList[nodeId] = [];
  });

  map.edges.forEach((edge) => {
    adjacencyList[edge.from].push({ node: edge.to, weight: edge.weight });
    adjacencyList[edge.to].push({ node: edge.from, weight: edge.weight });
  });

  return adjacencyList;
}

export function dijkstra(adjacencyList, start) {
  const distances = {};
  const previous = {};
  const visited = new Set();

  Object.keys(adjacencyList).forEach((nodeId) => {
    distances[nodeId] = Infinity;
    previous[nodeId] = null;
  });

  distances[start] = 0;

  while (visited.size < Object.keys(adjacencyList).length) {
    let currentNode = null;
    let smallestDistance = Infinity;

    Object.keys(distances).forEach((nodeId) => {
      if (!visited.has(nodeId) && distances[nodeId] < smallestDistance) {
        smallestDistance = distances[nodeId];
        currentNode = nodeId;
      }
    });

    if (currentNode === null) {
      break;
    }

    visited.add(currentNode);

    adjacencyList[currentNode].forEach((neighbor) => {
      const candidateDistance = distances[currentNode] + neighbor.weight;
      if (candidateDistance < distances[neighbor.node]) {
        distances[neighbor.node] = candidateDistance;
        previous[neighbor.node] = currentNode;
      }
    });
  }

  return { distances, previous };
}

export function reconstructPath(previous, target) {
  const path = [];
  let current = target;

  while (current) {
    path.unshift(current);
    current = previous[current];
  }

  return path;
}
