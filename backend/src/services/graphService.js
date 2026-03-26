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

class MinHeap {
  constructor() {
    this.values = [];
  }

  push(item) {
    this.values.push(item);
    this.bubbleUp(this.values.length - 1);
  }

  pop() {
    if (this.values.length === 0) {
      return null;
    }

    const top = this.values[0];
    const tail = this.values.pop();

    if (this.values.length > 0) {
      this.values[0] = tail;
      this.bubbleDown(0);
    }

    return top;
  }

  size() {
    return this.values.length;
  }

  bubbleUp(index) {
    let current = index;

    while (current > 0) {
      const parent = Math.floor((current - 1) / 2);
      if (this.values[parent].distance <= this.values[current].distance) {
        break;
      }
      [this.values[parent], this.values[current]] = [this.values[current], this.values[parent]];
      current = parent;
    }
  }

  bubbleDown(index) {
    let current = index;

    while (true) {
      const left = current * 2 + 1;
      const right = current * 2 + 2;
      let smallest = current;

      if (left < this.values.length && this.values[left].distance < this.values[smallest].distance) {
        smallest = left;
      }

      if (right < this.values.length && this.values[right].distance < this.values[smallest].distance) {
        smallest = right;
      }

      if (smallest === current) {
        break;
      }

      [this.values[smallest], this.values[current]] = [this.values[current], this.values[smallest]];
      current = smallest;
    }
  }
}

export function dijkstra(adjacencyList, start) {
  const distances = {};
  const previous = {};
  const heap = new MinHeap();

  Object.keys(adjacencyList).forEach((nodeId) => {
    distances[nodeId] = Infinity;
    previous[nodeId] = null;
  });

  distances[start] = 0;
  heap.push({ node: start, distance: 0 });

  while (heap.size() > 0) {
    const current = heap.pop();
    if (!current || current.distance > distances[current.node]) {
      continue;
    }

    adjacencyList[current.node].forEach((neighbor) => {
      const candidateDistance = distances[current.node] + neighbor.weight;
      if (candidateDistance < distances[neighbor.node]) {
        distances[neighbor.node] = candidateDistance;
        previous[neighbor.node] = current.node;
        heap.push({ node: neighbor.node, distance: candidateDistance });
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

export function calculatePathCost(path, adjacencyList) {
  if (!Array.isArray(path) || path.length < 2) {
    return 0;
  }

  let total = 0;

  for (let index = 0; index < path.length - 1; index += 1) {
    const from = path[index];
    const to = path[index + 1];
    const edge = adjacencyList[from].find((neighbor) => neighbor.node === to);
    if (edge) {
      total += edge.weight;
    }
  }

  return total;
}

export function dijkstraWithK(adjacencyList, start, targetNodes, k = 3) {
  const { distances, previous } = dijkstra(adjacencyList, start);

  const ranked = targetNodes
    .map((targetId) => ({
      targetId,
      distance: distances[targetId],
      path: reconstructPath(previous, targetId)
    }))
    .filter((item) => Number.isFinite(item.distance) && item.path.length > 0)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, k)
    .map((item, index) => ({
      rank: index + 1,
      targetId: item.targetId,
      distance: item.distance,
      path: item.path,
      pathCost: calculatePathCost(item.path, adjacencyList)
    }));

  return { distances, previous, ranked };
}
