const LEVELS = [1, 2, 3];
const SLOT_TEMPLATE = [
  { suffix: 'A1', type: 'car', category: 'premium', x: 600, y: 80 },
  { suffix: 'A2', type: 'car', category: 'standard', x: 760, y: 80 },
  { suffix: 'B1', type: 'car', category: 'standard', x: 600, y: 190 },
  { suffix: 'B2', type: 'car', category: 'handicapped', x: 760, y: 190 },
  { suffix: 'C1', type: 'bike', category: 'standard', x: 600, y: 320 },
  { suffix: 'C2', type: 'bike', category: 'ev_charge', x: 760, y: 320 },
  { suffix: 'D1', type: 'car', category: 'premium', x: 600, y: 450 },
  { suffix: 'D2', type: 'car', category: 'standard', x: 760, y: 450 }
];

const PRICING_MODEL = {
  standard: { baseRate: 120, perHour: 80 },
  premium: { baseRate: 220, perHour: 120 },
  handicapped: { baseRate: 70, perHour: 45 },
  ev_charge: { baseRate: 140, perHour: 95 }
};

const PRE_OCCUPIED = new Set(['L1_S_A2', 'L1_S_C2', 'L2_S_B1', 'L3_S_D2']);

function levelNodeId(level, suffix) {
  return `L${level}_${suffix}`;
}

function buildLevelNodes(level) {
  const nodes = {
    [levelNodeId(level, 'E1')]: {
      id: levelNodeId(level, 'E1'),
      label: `L${level} Entrance 1`,
      type: 'entrance',
      level,
      x: 60,
      y: 180
    },
    [levelNodeId(level, 'E2')]: {
      id: levelNodeId(level, 'E2'),
      label: `L${level} Entrance 2`,
      type: 'entrance',
      level,
      x: 60,
      y: 380
    },
    [levelNodeId(level, 'J1')]: {
      id: levelNodeId(level, 'J1'),
      label: `L${level} Junction 1`,
      type: 'junction',
      level,
      x: 220,
      y: 180
    },
    [levelNodeId(level, 'J2')]: {
      id: levelNodeId(level, 'J2'),
      label: `L${level} Junction 2`,
      type: 'junction',
      level,
      x: 220,
      y: 380
    },
    [levelNodeId(level, 'J3')]: {
      id: levelNodeId(level, 'J3'),
      label: `L${level} Central Lane`,
      type: 'junction',
      level,
      x: 420,
      y: 280
    }
  };

  SLOT_TEMPLATE.forEach((slot) => {
    const id = levelNodeId(level, `S_${slot.suffix}`);
    nodes[id] = {
      id,
      label: `L${level} ${slot.type === 'car' ? 'Car' : 'Bike'} ${slot.suffix}`,
      type: 'slot',
      slotType: slot.type,
      category: slot.category,
      level,
      x: slot.x,
      y: slot.y
    };
  });

  return nodes;
}

function buildLevelEdges(level) {
  const edges = [
    { from: levelNodeId(level, 'E1'), to: levelNodeId(level, 'J1'), weight: 2 },
    { from: levelNodeId(level, 'E2'), to: levelNodeId(level, 'J2'), weight: 2 },
    { from: levelNodeId(level, 'J1'), to: levelNodeId(level, 'J3'), weight: 3 },
    { from: levelNodeId(level, 'J2'), to: levelNodeId(level, 'J3'), weight: 3 }
  ];

  SLOT_TEMPLATE.forEach((slot, index) => {
    edges.push({
      from: levelNodeId(level, 'J3'),
      to: levelNodeId(level, `S_${slot.suffix}`),
      weight: 2 + (index % 4)
    });
  });

  return edges;
}

function buildAllNodes() {
  return LEVELS.reduce((acc, level) => ({ ...acc, ...buildLevelNodes(level) }), {});
}

function buildAllEdges() {
  const edges = LEVELS.flatMap((level) => buildLevelEdges(level));

  // Connect levels using an elevator/stair-like central lane bridge.
  for (let level = 1; level < LEVELS.length; level += 1) {
    edges.push({
      from: levelNodeId(level, 'J3'),
      to: levelNodeId(level + 1, 'J3'),
      weight: 4
    });
  }

  return edges;
}

function buildInitialSlots() {
  const slots = [];

  LEVELS.forEach((level) => {
    SLOT_TEMPLATE.forEach((slot, index) => {
      const id = levelNodeId(level, `S_${slot.suffix}`);
      const occupied = PRE_OCCUPIED.has(id);
      const seededVehicle = occupied ? `${slot.type === 'car' ? 'CAR' : 'BIK'}-${level}${index + 1}94` : null;

      slots.push({
        id,
        label: `L${level} ${slot.type === 'car' ? 'Car' : 'Bike'} ${slot.suffix}`,
        level,
        type: slot.type,
        category: slot.category,
        status: occupied ? 'occupied' : 'available',
        currentVehicle: seededVehicle,
        pricing: PRICING_MODEL[slot.category],
        assignedAt: occupied ? new Date(Date.now() - 1000 * 60 * (20 + level * 10 + index * 3)).toISOString() : null
      });
    });
  });

  return slots;
}

export const INITIAL_MAP = {
  levels: LEVELS,
  nodes: buildAllNodes(),
  edges: buildAllEdges()
};

export const INITIAL_SLOTS = buildInitialSlots();

export const ENTRANCES = LEVELS.flatMap((level) => [
  { id: levelNodeId(level, 'E1'), label: `Level ${level} - Entrance 1`, level },
  { id: levelNodeId(level, 'E2'), label: `Level ${level} - Entrance 2`, level }
]);

export const VEHICLE_TYPES = ['car', 'bike'];
export const SLOT_CATEGORIES = ['standard', 'premium', 'handicapped', 'ev_charge'];
export const DEFAULT_LEVEL = 1;
export const COST_CURRENCY = 'LKR';
