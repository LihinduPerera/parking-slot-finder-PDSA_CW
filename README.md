# Smart Parking Slot Finder

A modern full-stack web application for your **PDSA coursework** that demonstrates how a **Graph data structure** can solve a real-world parking allocation problem.

## Features

- Graph-based parking area modeling
- Dijkstra shortest-path recommendation
- Vehicle-type-aware slot allocation
- Live parking dashboard
- Visual parking map with highlighted route
- Admin controls to occupy, release, or reset slots
- Activity feed for recent system events
- Responsive modern UI for demo and viva

## Tech Stack

### Frontend
- React
- Vite
- Custom modern CSS UI

### Backend
- Node.js
- Express
- CORS

## Project Structure

```bash
smart-parking-pro/
├── backend/
│   ├── package.json
│   └── src/
│       ├── server.js
│       ├── data/
│       │   └── parkingData.js
│       └── services/
│           ├── graphService.js
│           └── parkingService.js
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       └── components/
└── README.md
```

## Setup Instructions

### 1. Start the backend

```bash
cd backend
npm install
npm start
```

Backend runs on:

```bash
http://localhost:5000
```

### 2. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend usually runs on:

```bash
http://localhost:5173
```

## Main API Endpoints

- `GET /api/dashboard` - load summary, slots, map, and history
- `POST /api/recommend` - find nearest available slot
- `POST /api/confirm` - confirm a recommended slot
- `PATCH /api/slots/:slotId` - manually update slot status
- `POST /api/release` - release a slot
- `POST /api/reset` - reset the simulation to default state

## Inputs

- Vehicle number
- Vehicle type
- Entrance point
- Parking slot availability

## Processing

1. Model the parking area as a graph.
2. Use Dijkstra's algorithm to calculate shortest paths.
3. Filter available slots by vehicle type.
4. Recommend the nearest available slot.
5. Display route and estimated travel time.
6. Update slot status dynamically.

## Outputs

- Recommended parking slot
- Shortest path to the slot
- Parking distance and estimated time
- Live dashboard with slot availability
- Visual map and recent activity log

## Viva Talking Points

- **Data Structure Used:** Graph
- **Algorithm Used:** Dijkstra's shortest path algorithm
- **Nodes:** Entrances, junctions, parking slots
- **Edges:** Roads/paths between nodes
- **Novelty:** nearest-slot recommendation, shortest-path navigation, live dashboard

## Suggested Report Title

**Graph-Based Smart Parking Slot Finder for Efficient Parking Allocation and Navigation**
