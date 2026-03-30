# Smart Parking Slot Finder - Full DSA Coursework Notes

## 1. What this system is (in DSA terms)

This project is a **graph-based resource allocation system**.

- Resource: parking slots
- Input constraints: vehicle type, entrance, preferred level/category
- Goal: pick the nearest valid slot and show route + cost
- Core algorithmic problem: **shortest path in a weighted graph**

So from a programming data structures and algorithms perspective, your project combines:

- Graph representation
- Priority queue (min-heap)
- Dijkstra shortest path
- Filtering/searching/sorting on arrays
- Hash-style lookup structures (objects, Set, Map)
- Aggregation/report generation logic

---

## 2. End-to-end flow

1. Backend builds parking map data (nodes + weighted edges + slot metadata).
2. Backend converts graph to an adjacency list for fast traversal.
3. User sends recommendation request (vehicle, entrance, preferences).
4. Backend filters eligible slots.
5. Backend runs Dijkstra from selected entrance.
6. Backend ranks nearest candidate slots and returns top 3 alternatives.
7. Frontend displays route, ETA, and estimated cost.
8. On confirmation/release, backend updates arrays and logs history.

---

## 3. Data structures used, why they are used, and what they do

## 3.1 Arrays

### Where

- `LEVELS`, `SLOT_TEMPLATE`
- Graph edge list (`edges`)
- Slot records (`slots`)
- Event logs (`history`, `vehicleHistory`)
- UI collections (`levels`, `alternatives`, report rows)

### Why

Arrays are ideal when:

- order matters
- we need iteration/map/filter/reduce/sort
- dynamic append is common (`push`)

### What they do in your app

- hold all slots and all edges
- allow filtering by status/type/category
- support sorting for ranking and table display
- hold report rows before CSV export

### Complexity notes

- Access by index: $O(1)$
- Find/filter/map over all items: $O(n)$
- Sort: $O(n \log n)$

---

## 3.2 Object (hash map style dictionary)

### Where

- `nodes` object (`nodeId -> nodeData`)
- `PRICING_MODEL` (`category -> pricing`)
- `adjacencyList` (`nodeId -> neighbors[]`)
- `distances` and `previous` in Dijkstra
- `slotLookup` in recommendation step

### Why

Objects provide very fast key-based access (average case):

- check/update by ID quickly
- avoid repeated linear searches

### What they do in your app

- represent graph nodes by unique id
- represent shortest known distance per node
- represent path parent pointers
- map slot id to slot details quickly

### Complexity notes

- Insert/read/update by key: average $O(1)$

---

## 3.3 Set

### Where

- `PRE_OCCUPIED` in seed data
- `nodeSet` in level map filtering
- unique CSV headers generation via `new Set(...)`

### Why

Set is used for:

- fast membership checking
- uniqueness enforcement

### What they do in your app

- decide if initial slot is occupied (`PRE_OCCUPIED.has(id)`)
- quickly check whether edge endpoints belong to current level
- deduplicate CSV header keys

### Complexity notes

- Membership check: average $O(1)$

---

## 3.4 Map

### Where

- `highlightedEdges` in map rendering

### Why

Map allows storing dynamic key-value pairs for route highlighting and makes repeated lookup easy.

### What it does

- marks route edges for 1st/2nd/3rd path alternatives
- supports bidirectional keying (`a-b` and `b-a`)

### Complexity notes

- set/get: average $O(1)$

---

## 3.5 Graph (weighted, undirected)

### Where

- Built in parking data as nodes + edge list
- Converted into adjacency list by `createAdjacencyList`

### Why graph is correct here

A parking layout is naturally a graph:

- entrances, junctions, slots are vertices
- lane connections are edges
- edge weights represent traversal cost/distance

### What it does

- enables shortest path routing from entrance to slot
- supports multi-level connectivity through bridge edges

---

## 3.6 Priority Queue (implemented using MinHeap)

### Where

- Custom `MinHeap` class in graph service

### Why

Dijkstra needs fast extraction of the node with minimum tentative distance.

If we used array-only selection each time, it becomes much slower.

### What it does

- `push`: inserts candidate node-distance pair
- `pop`: extracts smallest distance item
- internal `bubbleUp` and `bubbleDown` keep heap order

### Complexity notes

- push: $O(\log n)$
- pop: $O(\log n)$
- peek-min (implicit top): $O(1)$

---

## 4. Algorithms used, with purpose and complexity

## 4.1 Graph construction pipeline

### Functions

- `buildLevelNodes`
- `buildLevelEdges`
- `buildAllNodes`
- `buildAllEdges`
- `buildInitialSlots`

### Purpose

Generate all simulation data from templates and levels.

### DSA operations

- nested iteration (`forEach`, `reduce`, `flatMap`)
- object merging and dynamic key generation

### Complexity (high level)

Let:

- $L$ = number of levels
- $S$ = slots per level

Then node and slot generation is roughly $O(L \cdot S)$ and edge generation is similar scale.

---

## 4.2 `createAdjacencyList(map)`

### Purpose

Convert edge list into adjacency list for efficient graph traversal.

### Why needed

Neighbor lookup is much faster with adjacency list than scanning all edges every time.

### Complexity

- Initialize node keys: $O(V)$
- Insert each undirected edge twice: $O(E)$
- Total: $O(V + E)$

---

## 4.3 Dijkstra shortest path

### Function

- `dijkstra(adjacencyList, start)`

### Purpose

Compute shortest distances from one entrance to all nodes.

### Core idea

Always expand the currently cheapest reachable node first.

### Key data structures used inside

- `distances` object
- `previous` object
- min-heap priority queue

### Complexity

With binary heap priority queue:

$$
O((V + E) \log V)
$$

This is the most important algorithm in your coursework.

---

## 4.4 Path reconstruction

### Function

- `reconstructPath(previous, target)`

### Purpose

Rebuild actual route from parent pointers after Dijkstra.

### Method

Start at target and keep following `previous[current]` back to start, then reverse using `unshift` pattern.

### Complexity

- $O(p)$ where $p$ is path length

---

## 4.5 Path cost recomputation

### Function

- `calculatePathCost(path, adjacencyList)`

### Purpose

Compute sum of edge weights for a chosen path.

### Note

For each adjacent pair in path, it does neighbor search (`find`) on adjacency list entry.

Complexity roughly depends on path length and average node degree.

---

## 4.6 Top-k nearest slots

### Function

- `dijkstraWithK(adjacencyList, start, targetNodes, k = 3)`

### Purpose

Get nearest valid target slots and return ranked alternatives.

### Steps

1. Run Dijkstra once from entrance.
2. Build candidate objects for each target slot.
3. Remove unreachable targets.
4. Sort by distance.
5. Take top `k`.

### Complexity

If $T$ is number of target nodes:

- Build/filter list: $O(T)$
- Sort targets: $O(T \log T)$
- Total with Dijkstra: $O((V+E)\log V + T\log T)$

---

## 4.7 Slot recommendation filtering

### Function

- `recommendSlot(...)` in parking service

### Purpose

Apply business constraints before shortest-path ranking.

### DSA pattern

- Multi-condition filtering over slots
- Fallback strategy if strict preferences return empty list

### Complexity

For $N$ slots:

- filtering candidate/fallback: $O(N)$ each
- with Dijkstra and ranking, overall dominated by Dijkstra + sorting

---

## 4.8 Reporting algorithms

### Function

- `generateReport(reportType)`

### What it uses

- map/filter for grouping by level/category/type
- sorting occupied levels for top list
- array slicing for windows (`slice(-20)`, top 3)

### Complexity notes

- by-level map: $O(L)$
- by-category and by-type sections: repeated scans over slots, around $O(CN + TN)$
- top levels sort: $O(L \log L)$

---

## 4.9 Frontend data transformations

### Key examples

- Slot table sorting: level then label
- Route highlight map creation (`Map`)
- CSV conversion with deduplicated headers (`Set`)
- Peak value extraction using `reduce`

### Complexity notes

- table sort: $O(N \log N)$
- CSV header flattening over all rows/keys
- route edge marking proportional to total path lengths shown

---

## 5. Why these DSA choices are good for this project

1. Graph + Dijkstra is the correct model for route minimization in weighted parking lanes.
2. Adjacency list scales better than adjacency matrix for sparse graphs.
3. MinHeap makes shortest-path computation efficient.
4. Objects/Set/Map improve lookup performance and code clarity.
5. Array pipeline methods (`map/filter/reduce/sort`) make reporting and UI transformations clean and maintainable.

---

## 6. Important code-level observations (academic discussion points)

1. `clone` uses JSON serialization.
   - Good for plain data cloning.
   - Not ideal if keeping functions, class instances, or Date objects as Date types.

2. `getSummary()` performs multiple full-array filters.
   - Easy to read.
   - Can be optimized to one pass reduce if slot count becomes very large.

3. Dijkstra uses "stale entry skipping" (`current.distance > distances[current.node]`) instead of explicit visited set.
   - This is a standard valid optimization style with heaps.

4. In top-k ranking, all targets are sorted before slicing.
   - Correct and simple.
   - Could be optimized with selection algorithms for very large target sets.

---

## 7. Full complexity cheat sheet for viva/exam

Let:

- $V$ = number of nodes
- $E$ = number of edges
- $N$ = number of slots
- $T$ = number of eligible target slots

Core operations:

- Build adjacency list: $O(V+E)$
- Dijkstra with MinHeap: $O((V+E)\log V)$
- Path reconstruction: $O(p)$
- Candidate slot filtering: $O(N)$
- Target ranking sort: $O(T\log T)$
- Slot table UI sort: $O(N\log N)$

Overall recommendation pipeline:

$$
O(N) + O((V+E)\log V) + O(T\log T)
$$

In your current project scale, this is very efficient.

---

## 8. What each major file contributes (DSA mapping)

- `backend/src/data/parkingData.js`
  - Generates graph data and slot records using arrays, objects, Set, and template expansion.

- `backend/src/services/graphService.js`
  - Core graph algorithms and structures: adjacency list, MinHeap, Dijkstra, top-k ranking, path reconstruction.

- `backend/src/services/parkingService.js`
  - Business logic layer using filtering/grouping/aggregation plus graph search integration.

- `frontend/src/App.jsx`
  - Data transformation for CSV export, report row normalization, reduce-based analytics, and stateful orchestration.

- `frontend/src/components/ParkingMap.jsx`
  - Route rendering logic with lookup map and highlighted edge map.

- `frontend/src/components/SlotTable.jsx`
  - Stable sorted operational table for slots.

---

## 9. Pseudocode you can write in exam

### Dijkstra with MinHeap

```text
function dijkstra(graph, start):
    for each vertex v in graph:
        dist[v] = infinity
        prev[v] = null
    dist[start] = 0

    pq = minHeap()
    pq.push((start, 0))

    while pq not empty:
        (u, du) = pq.popMin()
        if du > dist[u]:
            continue

        for each edge (u -> v, w) in graph[u]:
            alt = dist[u] + w
            if alt < dist[v]:
                dist[v] = alt
                prev[v] = u
                pq.push((v, alt))

    return dist, prev
```

### Reconstruct path

```text
function reconstruct(prev, target):
    path = []
    cur = target
    while cur != null:
        path.prepend(cur)
        cur = prev[cur]
    return path
```

---

## 10. Viva-ready question bank with short answers

1. Why not BFS?
   - BFS works for unweighted graphs only (or equal weights). Your lanes have weighted distances, so Dijkstra is needed.

2. Why adjacency list instead of matrix?
   - Parking graph is sparse. Adjacency list uses less memory and faster neighbor iteration.

3. Why MinHeap?
   - Efficient extraction of minimum-distance node; improves Dijkstra performance.

4. What is the role of `previous`?
   - It stores parent links to rebuild actual shortest path.

5. Is your graph directed?
   - Implemented as undirected by adding both directions for every edge.

6. How are alternatives found?
   - Run one Dijkstra from entrance, rank all eligible slots by computed distance, take top 3.

7. Can this support more floors?
   - Yes. Data generation is level-based and scales by extending level list/template.

---

## 11. Possible improvements (advanced discussion)

1. Use a single-pass reducer in `getSummary()` to avoid multiple scans.
2. Cache route computations per entrance if requests are frequent and map is static.
3. Consider A* if you add directional heuristics and larger maps.
4. Add occupancy prediction model and dynamic edge weights (traffic-based).
5. Use typed structures (TypeScript interfaces) for safer large-scale maintenance.

---

## 12. Final study summary

Your coursework demonstrates strong practical use of DSA:

- Correct graph modeling for parking topology
- Correct shortest-path algorithm choice (Dijkstra)
- Efficient priority queue implementation (binary min-heap)
- Good use of hash-like structures (Object/Set/Map)
- Real-world aggregation/sorting/filtering pipelines for dashboards and reports

If you can explain:

- graph model
- Dijkstra flow
- heap operations
- complexity formulas
- filtering/ranking/reporting logic

you can confidently defend this system in a Programming Data Structures and Algorithms assessment.
