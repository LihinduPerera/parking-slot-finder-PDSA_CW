export const INITIAL_MAP = {
  nodes: {
    E1: { id: 'E1', label: 'Entrance 1', type: 'entrance', x: 60, y: 180 },
    E2: { id: 'E2', label: 'Entrance 2', type: 'entrance', x: 60, y: 380 },
    J1: { id: 'J1', label: 'Junction 1', type: 'junction', x: 220, y: 180 },
    J2: { id: 'J2', label: 'Junction 2', type: 'junction', x: 220, y: 380 },
    J3: { id: 'J3', label: 'Central Lane', type: 'junction', x: 420, y: 280 },
    S1: { id: 'S1', label: 'Car A1', type: 'slot', slotType: 'car', x: 600, y: 80 },
    S2: { id: 'S2', label: 'Car A2', type: 'slot', slotType: 'car', x: 760, y: 80 },
    S3: { id: 'S3', label: 'Car B1', type: 'slot', slotType: 'car', x: 600, y: 190 },
    S4: { id: 'S4', label: 'Car B2', type: 'slot', slotType: 'car', x: 760, y: 190 },
    S5: { id: 'S5', label: 'Bike C1', type: 'slot', slotType: 'bike', x: 600, y: 320 },
    S6: { id: 'S6', label: 'Bike C2', type: 'slot', slotType: 'bike', x: 760, y: 320 },
    S7: { id: 'S7', label: 'Car D1', type: 'slot', slotType: 'car', x: 600, y: 450 },
    S8: { id: 'S8', label: 'Car D2', type: 'slot', slotType: 'car', x: 760, y: 450 }
  },
  edges: [
    { from: 'E1', to: 'J1', weight: 2 },
    { from: 'E2', to: 'J2', weight: 2 },
    { from: 'J1', to: 'J3', weight: 3 },
    { from: 'J2', to: 'J3', weight: 3 },
    { from: 'J3', to: 'S1', weight: 4 },
    { from: 'J3', to: 'S2', weight: 5 },
    { from: 'J3', to: 'S3', weight: 2 },
    { from: 'J3', to: 'S4', weight: 3 },
    { from: 'J3', to: 'S5', weight: 2 },
    { from: 'J3', to: 'S6', weight: 3 },
    { from: 'J3', to: 'S7', weight: 4 },
    { from: 'J3', to: 'S8', weight: 5 }
  ]
};

export const INITIAL_SLOTS = [
  { id: 'S1', label: 'Car A1', type: 'car', status: 'available', currentVehicle: null },
  { id: 'S2', label: 'Car A2', type: 'car', status: 'occupied', currentVehicle: 'CAX-9021' },
  { id: 'S3', label: 'Car B1', type: 'car', status: 'available', currentVehicle: null },
  { id: 'S4', label: 'Car B2', type: 'car', status: 'available', currentVehicle: null },
  { id: 'S5', label: 'Bike C1', type: 'bike', status: 'available', currentVehicle: null },
  { id: 'S6', label: 'Bike C2', type: 'bike', status: 'occupied', currentVehicle: 'BID-7711' },
  { id: 'S7', label: 'Car D1', type: 'car', status: 'available', currentVehicle: null },
  { id: 'S8', label: 'Car D2', type: 'car', status: 'occupied', currentVehicle: 'KDH-4478' }
];

export const ENTRANCES = [
  { id: 'E1', label: 'Entrance 1' },
  { id: 'E2', label: 'Entrance 2' }
];

export const VEHICLE_TYPES = ['car', 'bike'];
