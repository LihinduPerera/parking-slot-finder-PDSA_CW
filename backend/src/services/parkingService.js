import {
  COST_CURRENCY,
  DEFAULT_LEVEL,
  ENTRANCES,
  INITIAL_MAP,
  INITIAL_SLOTS,
  SLOT_CATEGORIES,
  VEHICLE_TYPES
} from '../data/parkingData.js';
import { createAdjacencyList, dijkstraWithK } from './graphService.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

class ParkingService {
  constructor() {
    this.reset();
  }

  reset() {
    this.map = clone(INITIAL_MAP);
    this.slots = clone(INITIAL_SLOTS);
    this.history = [
      {
        id: 1,
        timestamp: new Date().toISOString(),
        action: 'system-seed',
        details: 'Initial multi-level parking layout loaded with sample occupancy and categories.'
      }
    ];
    this.assignmentCounter = 2;
    this.totalRevenue = 0;
    this.vehicleHistory = [];
    this.adjacencyList = createAdjacencyList(this.map);
  }

  getSummary() {
    const total = this.slots.length;
    const available = this.slots.filter((slot) => slot.status === 'available').length;
    const occupied = total - available;
    const availableCars = this.slots.filter((slot) => slot.type === 'car' && slot.status === 'available').length;
    const availableBikes = this.slots.filter((slot) => slot.type === 'bike' && slot.status === 'available').length;
    const premiumAvailable = this.slots.filter((slot) => slot.category === 'premium' && slot.status === 'available').length;
    const evAvailable = this.slots.filter((slot) => slot.category === 'ev_charge' && slot.status === 'available').length;

    return {
      totalSlots: total,
      availableSlots: available,
      occupiedSlots: occupied,
      carSlotsAvailable: availableCars,
      bikeSlotsAvailable: availableBikes,
      premiumSlotsAvailable: premiumAvailable,
      evSlotsAvailable: evAvailable,
      occupancyRate: Number(((occupied / total) * 100).toFixed(1)),
      totalRevenue: this.totalRevenue
    };
  }

  getLevelsOverview() {
    return this.map.levels.map((level) => {
      const levelSlots = this.slots.filter((slot) => slot.level === level);
      const available = levelSlots.filter((slot) => slot.status === 'available').length;
      return {
        level,
        total: levelSlots.length,
        available,
        occupied: levelSlots.length - available
      };
    });
  }

  getMapByLevel(level = DEFAULT_LEVEL) {
    const parsedLevel = Number(level) || DEFAULT_LEVEL;
    const nodes = Object.fromEntries(
      Object.entries(this.map.nodes).filter(([, node]) => node.level === parsedLevel)
    );

    const nodeSet = new Set(Object.keys(nodes));
    const edges = this.map.edges.filter((edge) => nodeSet.has(edge.from) && nodeSet.has(edge.to));

    return {
      level: parsedLevel,
      levels: this.map.levels,
      nodes,
      edges
    };
  }

  getDashboard({ level } = {}) {
    const selectedLevel = Number(level) || DEFAULT_LEVEL;

    return {
      summary: this.getSummary(),
      slots: this.slots,
      map: this.getMapByLevel(selectedLevel),
      entrances: ENTRANCES,
      vehicleTypes: VEHICLE_TYPES,
      slotCategories: SLOT_CATEGORIES,
      selectedLevel,
      levels: this.getLevelsOverview(),
      pricingModel: {
        currency: COST_CURRENCY,
        categories: SLOT_CATEGORIES.reduce((acc, category) => {
          const sampleSlot = this.slots.find((slot) => slot.category === category);
          acc[category] = sampleSlot?.pricing || null;
          return acc;
        }, {})
      },
      recentHistory: this.history.slice().reverse().slice(0, 8)
    };
  }

  getHistory() {
    return this.history.slice().reverse();
  }

  getVehicleHistory(vehicleNumber) {
    if (!vehicleNumber) {
      return [];
    }

    const normalized = vehicleNumber.trim().toUpperCase();
    return this.vehicleHistory.filter((entry) => entry.vehicleNumber === normalized).reverse();
  }

  getPeakHoursAnalytics() {
    return {
      currency: COST_CURRENCY,
      points: [
        { hour: '08:00', occupancyRate: 38 },
        { hour: '10:00', occupancyRate: 52 },
        { hour: '12:00', occupancyRate: 72 },
        { hour: '14:00', occupancyRate: 81 },
        { hour: '16:00', occupancyRate: 69 },
        { hour: '18:00', occupancyRate: 58 },
        { hour: '20:00', occupancyRate: 43 }
      ]
    };
  }

  calculateParkingCost(slotId, durationMinutes = 60) {
    const slot = this.slots.find((item) => item.id === slotId);
    if (!slot) {
      throw new Error('Slot not found.');
    }

    const safeDuration = Math.max(15, Number(durationMinutes) || 60);
    const hourlyUnits = Math.ceil(safeDuration / 60);
    const base = slot.pricing.baseRate;
    const usage = hourlyUnits * slot.pricing.perHour;
    const total = base + usage;

    return {
      currency: COST_CURRENCY,
      slotId,
      slotLabel: slot.label,
      category: slot.category,
      durationMinutes: safeDuration,
      breakdown: {
        baseRate: base,
        perHour: slot.pricing.perHour,
        billedHours: hourlyUnits,
        usage
      },
      total
    };
  }

  recommendSlot({ vehicleNumber, vehicleType, entranceId, preferredLevel, preferredCategory, estimatedDurationMinutes }) {
    if (!vehicleNumber || !vehicleType || !entranceId) {
      throw new Error('Vehicle number, vehicle type, and entrance are required.');
    }

    if (!VEHICLE_TYPES.includes(vehicleType)) {
      throw new Error('Unsupported vehicle type.');
    }

    const entranceExists = ENTRANCES.some((entrance) => entrance.id === entranceId);
    if (!entranceExists) {
      throw new Error('Invalid entrance selected.');
    }

    if (preferredCategory && !SLOT_CATEGORIES.includes(preferredCategory)) {
      throw new Error('Unsupported slot category selected.');
    }

    const targetLevel = Number(preferredLevel) || null;

    const candidateSlots = this.slots.filter((slot) => {
      const typeMatch = slot.type === vehicleType;
      const statusMatch = slot.status === 'available';
      const levelMatch = targetLevel ? slot.level === targetLevel : true;
      const categoryMatch = preferredCategory ? slot.category === preferredCategory : true;
      return typeMatch && statusMatch && levelMatch && categoryMatch;
    });

    const fallbackSlots = this.slots.filter((slot) => slot.type === vehicleType && slot.status === 'available');

    const eligibleSlots = candidateSlots.length > 0 ? candidateSlots : fallbackSlots;

    if (eligibleSlots.length === 0) {
      return null;
    }

    const { ranked } = dijkstraWithK(
      this.adjacencyList,
      entranceId,
      eligibleSlots.map((slot) => slot.id),
      3
    );

    if (ranked.length === 0) {
      return null;
    }

    const slotLookup = Object.fromEntries(this.slots.map((slot) => [slot.id, slot]));
    const durationForEstimate = Number(estimatedDurationMinutes) || 90;

    const alternatives = ranked.map((item) => {
      const slot = slotLookup[item.targetId];
      const cost = this.calculateParkingCost(item.targetId, durationForEstimate);
      return {
        rank: item.rank,
        slotId: slot.id,
        slotLabel: slot.label,
        level: slot.level,
        category: slot.category,
        distance: item.distance,
        path: item.path,
        pathCost: item.pathCost,
        estimatedTimeMinutes: Math.max(1, Math.ceil(item.distance / 2)),
        estimatedCost: cost.total,
        estimatedCostBreakdown: cost.breakdown
      };
    });

    const primary = alternatives[0];

    return {
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      vehicleType,
      entranceId,
      slotId: primary.slotId,
      slotLabel: primary.slotLabel,
      level: primary.level,
      category: primary.category,
      path: primary.path,
      distance: primary.distance,
      estimatedTimeMinutes: primary.estimatedTimeMinutes,
      estimatedDurationMinutes: durationForEstimate,
      estimatedCost: primary.estimatedCost,
      estimatedCostBreakdown: primary.estimatedCostBreakdown,
      alternatives,
      message: `${primary.slotLabel} is the nearest available ${vehicleType} slot from ${entranceId}.`,
      note:
        candidateSlots.length === 0 && targetLevel
          ? 'No matching slots in preferred level/category. Showing nearest alternatives from all levels.'
          : null
    };
  }

  getSlotById(slotId) {
    return this.slots.find((item) => item.id === slotId);
  }

  confirmAssignment({ slotId, vehicleNumber, vehicleType, entranceId, path, distance }) {
    const slot = this.getSlotById(slotId);
    if (!slot) {
      throw new Error('Slot not found.');
    }

    if (slot.status === 'occupied') {
      throw new Error('Slot is already occupied.');
    }

    slot.status = 'occupied';
    slot.currentVehicle = vehicleNumber;
    slot.assignedAt = new Date().toISOString();

    const durationForEstimate = 90;
    const projectedCost = this.calculateParkingCost(slotId, durationForEstimate).total;

    this.history.push({
      id: this.assignmentCounter++,
      timestamp: new Date().toISOString(),
      action: 'assignment-confirmed',
      details: `${vehicleType.toUpperCase()} ${vehicleNumber} assigned to ${slot.label} (${slot.category}) from ${entranceId}. Distance ${distance}. Projected ${durationForEstimate} min cost: ${COST_CURRENCY} ${projectedCost}. Path: ${path.join(' -> ')}`
    });

    return slot;
  }

  updateSlotStatus(slotId, status, vehicleNumber = null) {
    const slot = this.getSlotById(slotId);
    if (!slot) {
      throw new Error('Slot not found.');
    }

    if (!['available', 'occupied'].includes(status)) {
      throw new Error('Invalid slot status.');
    }

    slot.status = status;
    slot.currentVehicle = status === 'occupied' ? vehicleNumber || slot.currentVehicle || 'MANUAL-SET' : null;
    slot.assignedAt = status === 'occupied' ? new Date().toISOString() : null;

    this.history.push({
      id: this.assignmentCounter++,
      timestamp: new Date().toISOString(),
      action: 'slot-status-updated',
      details: `${slot.label} (${slot.category}) manually updated to ${status}.`
    });

    return slot;
  }

  releaseSlot(slotId) {
    const slot = this.getSlotById(slotId);
    if (!slot) {
      throw new Error('Slot not found.');
    }

    const releasedVehicle = slot.currentVehicle;
    const enteredAt = slot.assignedAt ? new Date(slot.assignedAt).getTime() : null;
    const durationMinutes = enteredAt ? Math.max(15, Math.round((Date.now() - enteredAt) / 60000)) : 60;
    const cost = this.calculateParkingCost(slot.id, durationMinutes);

    if (releasedVehicle) {
      this.vehicleHistory.push({
        id: this.assignmentCounter,
        vehicleNumber: releasedVehicle,
        slotId: slot.id,
        slotLabel: slot.label,
        category: slot.category,
        level: slot.level,
        parkedMinutes: durationMinutes,
        totalCost: cost.total,
        currency: COST_CURRENCY,
        releasedAt: new Date().toISOString()
      });
      this.totalRevenue += cost.total;
    }

    slot.status = 'available';
    slot.currentVehicle = null;
    slot.assignedAt = null;

    this.history.push({
      id: this.assignmentCounter++,
      timestamp: new Date().toISOString(),
      action: 'slot-released',
      details: `${slot.label} released${releasedVehicle ? ` from vehicle ${releasedVehicle}` : ''}. Billing: ${COST_CURRENCY} ${cost.total}.`
    });

    return slot;
  }

  generateReport(reportType) {
  console.log('NEW generateReport running for:', reportType);
  const timestamp = new Date().toISOString();
  const summary = this.getSummary();
  const levels = this.getLevelsOverview();

  const activeVehicles = this.slots.filter(
    (slot) => slot.status === 'occupied' && slot.currentVehicle
  ).length;

  const processedVehicles = this.vehicleHistory.length;
  const totalVehicleSessions = activeVehicles + processedVehicles;

  const safeRate = (occupied, total) =>
    total > 0 ? Number(((occupied / total) * 100).toFixed(1)) : 0;

  const metadata = {
    generatedAt: timestamp,
    generatedBy: 'Smart Parking Slot Finder',
    systemStatus: 'online',
    currency: COST_CURRENCY
  };

  if (reportType === 'daily') {
    return {
      type: 'daily',
      debugVersion: 'NEW-REPORT-V2',
      reportName: 'Daily Parking Summary Report',
      ...metadata,
      summary,
      totals: {
        activeVehicles,
        processedVehicles,
        totalVehicleSessions,
        totalRevenue: this.totalRevenue
      },
      topOccupiedLevels: levels
        .slice()
        .sort((a, b) => b.occupied - a.occupied)
        .slice(0, 3),
      recentActivity: this.history.slice(-20)
    };
  }

  if (reportType === 'occupancy') {
    return {
      type: 'occupancy',
      reportName: 'Occupancy Analysis Report',
      ...metadata,
      summary,
      byLevel: levels.map((level) => ({
        ...level,
        occupancyRate: safeRate(level.occupied, level.total)
      })),
      byCategory: SLOT_CATEGORIES.map((category) => {
        const slots = this.slots.filter((s) => s.category === category);
        const total = slots.length;
        const available = slots.filter((s) => s.status === 'available').length;
        const occupied = total - available;

        return {
          category,
          total,
          available,
          occupied,
          occupancyRate: safeRate(occupied, total)
        };
      }),
      byType: ['car', 'bike'].map((type) => {
        const slots = this.slots.filter((s) => s.type === type);
        const total = slots.length;
        const available = slots.filter((s) => s.status === 'available').length;
        const occupied = total - available;

        return {
          type,
          total,
          available,
          occupied,
          occupancyRate: safeRate(occupied, total)
        };
      })
    };
  }

  if (reportType === 'activity') {
    return {
      type: 'activity',
      reportName: 'System Activity Report',
      ...metadata,
      totals: {
        totalEvents: this.history.length,
        activeVehicles,
        processedVehicles,
        totalVehicleSessions
      },
      events: this.history.map((event) => ({
        ...event,
        timestamp: event.timestamp
      })),
      vehicleHistory: this.vehicleHistory.map((vh) => ({
        ...vh,
        estimatedCost: vh.totalCost
      }))
    };
  }

  throw new Error(`Unknown report type: ${reportType}`);
  }
}

export const parkingService = new ParkingService();
