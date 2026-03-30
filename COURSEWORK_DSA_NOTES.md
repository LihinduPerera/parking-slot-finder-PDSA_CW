# Smart Parking Slot Finder - Concise DSA Coursework Notes

## 1. Introduction

This project is a smart parking recommendation system built with a React frontend and a Node.js backend. It simulates a multi-level parking facility, tracks slot occupancy, and recommends the best available slot for a driver based on constraints such as entrance point, vehicle type, and slot preference.

From a Data Structures and Algorithms (DSA) perspective, the project is centered on graph modeling and shortest-path search, supported by practical array and hash-based operations for filtering, sorting, and reporting.

---

## 2. Problem Statement

In a real parking environment, drivers need fast and efficient guidance to the nearest valid slot. A naive linear scan is not enough because distance matters and parking lanes form a connected network with weighted travel costs.

The core computational problem is:

- Model the parking layout as a weighted graph.
- Filter slots by constraints (availability, vehicle compatibility, category preferences).
- Compute shortest travel paths from an entrance to candidate slots.
- Return top-k nearest valid recommendations with route and estimated cost.

This is solved using Dijkstra's algorithm with a min-heap priority queue.

---

## 3. Main DSA Components Used

1. Arrays
- Used for slots, edges, histories, and UI lists.
- Support `map`, `filter`, `reduce`, `sort`, and slicing operations.
- Typical costs: access $O(1)$, scan $O(n)$, sort $O(n \log n)$.

2. Objects (hash-map style)
- Used for node lookup, pricing maps, adjacency list buckets, and Dijkstra state (`distances`, `previous`).
- Average key-based read/write is $O(1)$.

3. Set
- Used for fast membership checks and uniqueness (pre-occupied slots, unique CSV headers).
- Average membership check is $O(1)$.

4. Map
- Used in route highlighting for dynamic edge markers in visualization.
- Average get/set is $O(1)$.

5. Weighted Undirected Graph
- Nodes represent entrances/junctions/slots.
- Edges represent lanes with traversal weights.
- Enables realistic route optimization.

6. MinHeap (Priority Queue)
- Used by Dijkstra to extract the next minimum-distance node efficiently.
- `push` and `pop` are $O(\log n)$.

---

## 4. Core Algorithms and Purpose

1. Adjacency list creation (`createAdjacencyList`)
- Converts node/edge data into traversal-friendly structure.
- Complexity: $O(V + E)$.

2. Dijkstra shortest path (`dijkstra`)
- Computes minimum distances from selected entrance.
- Uses `distances`, `previous`, and MinHeap.
- Complexity: $O((V + E) \log V)$.

3. Path reconstruction (`reconstructPath`)
- Rebuilds actual route from parent pointers.
- Complexity: $O(p)$ where $p$ is path length.

4. Top-k nearest targets (`dijkstraWithK`)
- Runs Dijkstra once, then ranks eligible target slots.
- Complexity: $O((V + E) \log V + T \log T)$.

5. Slot recommendation filtering (`recommendSlot`)
- Applies business constraints before ranking.
- Linear scans over slots: $O(N)$ per filtering pass.

6. Reporting and analytics (`generateReport` + frontend transforms)
- Uses aggregation, grouping, and sorting for dashboard/report views.
- Dominated by scan/sort operations like $O(N)$ and $O(N \log N)$.

---

## 5. End-to-End Flow

1. Build graph and slot data from level templates.
2. Convert graph to adjacency list.
3. Receive recommendation request.
4. Filter eligible slots by constraints.
5. Run Dijkstra from selected entrance.
6. Rank candidate slots and return top 3.
7. Show route, ETA, and cost in frontend.
8. Update occupancy and activity history on confirmation/release.

---

## 6. Complexity Summary (Viva Quick Sheet)

Let:

- $V$: graph nodes
- $E$: graph edges
- $N$: total slots
- $T$: eligible target slots

Key costs:

- Adjacency list build: $O(V + E)$
- Dijkstra with MinHeap: $O((V + E) \log V)$
- Filtering slots: $O(N)$
- Ranking targets: $O(T \log T)$

Overall recommendation pipeline:

$$
O(N) + O((V + E) \log V) + O(T \log T)
$$

---

## 7. File-to-DSA Mapping

- `backend/src/data/parkingData.js`: template-based data generation (arrays, objects, sets).
- `backend/src/services/graphService.js`: adjacency list, MinHeap, Dijkstra, path reconstruction, top-k logic.
- `backend/src/services/parkingService.js`: filtering constraints and recommendation orchestration.
- `frontend/src/App.jsx`: reporting transforms, CSV prep, and state coordination.
- `frontend/src/components/ParkingMap.jsx`: highlighted route edge mapping (`Map`).
- `frontend/src/components/SlotTable.jsx`: sorted slot presentation.

---

## 8. Viva-Ready Talking Points

1. Why Dijkstra and not BFS?
- BFS assumes equal edge weights; parking lanes use weighted distances.

2. Why adjacency list?
- Parking graph is sparse; adjacency list is memory-efficient and fast for neighbor iteration.

3. Why MinHeap?
- Improves shortest-path performance via efficient minimum extraction.

4. How are alternatives generated?
- One Dijkstra run from entrance, then sort eligible slots by computed distance and take top 3.

5. How does the system scale?
- Level/template-based generation supports additional floors and slots with predictable complexity.

---

## 9. Short Conclusion

This project demonstrates correct and practical DSA usage for a real-world routing problem: graph modeling, shortest path computation, efficient priority queue operations, and clean data-processing pipelines for analytics and UI.