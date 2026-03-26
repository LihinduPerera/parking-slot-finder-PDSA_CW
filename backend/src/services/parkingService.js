import { ENTRANCES, INITIAL_MAP, INITIAL_SLOTS, VEHICLE_TYPES } from '../data/parkingData.js';
import { createAdjacencyList, dijkstra, reconstructPath } from './graphService.js';

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
        details: 'Initial parking layout loaded with sample occupancy.'
      }
    ];
    this.assignmentCounter = 2;
    this.adjacencyList = createAdjacencyList(this.map);
  }

  getSummary() {
    const total = this.slots.length;
    const available = this.slots.filter((slot) => slot.status === 'available').length;
    const occupied = total - available;
    const availableCars = this.slots.filter((slot) => slot.type === 'car' && slot.status === 'available').length;
    const availableBikes = this.slots.filter((slot) => slot.type === 'bike' && slot.status === 'available').length;

    return {
      totalSlots: total,
      availableSlots: available,
      occupiedSlots: occupied,
      carSlotsAvailable: availableCars,
      bikeSlotsAvailable: availableBikes,
      occupancyRate: Number(((occupied / total) * 100).toFixed(1))
    };
  }

  getDashboard() {
    return {
      summary: this.getSummary(),
      slots: this.slots,
      map: this.map,
      entrances: ENTRANCES,
      vehicleTypes: VEHICLE_TYPES,
      recentHistory: this.history.slice().reverse().slice(0, 8)
    };
  }

  getHistory() {
    return this.history.slice().reverse();
  }

  recommendSlot({ vehicleNumber, vehicleType, entranceId }) {
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

    const { distances, previous } = dijkstra(this.adjacencyList, entranceId);

    const candidateSlots = this.slots.filter(
      (slot) => slot.type === vehicleType && slot.status === 'available'
    );

    if (candidateSlots.length === 0) {
      return null;
    }

    let recommendedSlot = null;
    let shortestDistance = Infinity;

    candidateSlots.forEach((slot) => {
      const distance = distances[slot.id];
      if (distance < shortestDistance) {
        shortestDistance = distance;
        recommendedSlot = slot;
      }
    });

    if (!recommendedSlot) {
      return null;
    }

    const path = reconstructPath(previous, recommendedSlot.id);
    const estimatedTimeMinutes = Math.max(1, Math.ceil(shortestDistance / 2));

    return {
      vehicleNumber,
      vehicleType,
      entranceId,
      slotId: recommendedSlot.id,
      slotLabel: recommendedSlot.label,
      path,
      distance: shortestDistance,
      estimatedTimeMinutes,
      message: `${recommendedSlot.label} is the nearest available ${vehicleType} slot from ${entranceId}.`
    };
  }

  confirmAssignment({ slotId, vehicleNumber, vehicleType, entranceId, path, distance }) {
    const slot = this.slots.find((item) => item.id === slotId);
    if (!slot) {
      throw new Error('Slot not found.');
    }

    if (slot.status === 'occupied') {
      throw new Error('Slot is already occupied.');
    }

    slot.status = 'occupied';
    slot.currentVehicle = vehicleNumber;

    this.history.push({
      id: this.assignmentCounter++,
      timestamp: new Date().toISOString(),
      action: 'assignment-confirmed',
      details: `${vehicleType.toUpperCase()} ${vehicleNumber} assigned to ${slot.label} from ${entranceId}. Distance ${distance}. Path: ${path.join(' -> ')}`
    });

    return slot;
  }

  updateSlotStatus(slotId, status, vehicleNumber = null) {
    const slot = this.slots.find((item) => item.id === slotId);
    if (!slot) {
      throw new Error('Slot not found.');
    }

    if (!['available', 'occupied'].includes(status)) {
      throw new Error('Invalid slot status.');
    }

    slot.status = status;
    slot.currentVehicle = status === 'occupied' ? vehicleNumber || slot.currentVehicle || 'MANUAL-SET' : null;

    this.history.push({
      id: this.assignmentCounter++,
      timestamp: new Date().toISOString(),
      action: 'slot-status-updated',
      details: `${slot.label} manually updated to ${status}.`
    });

    return slot;
  }

  releaseSlot(slotId) {
    const slot = this.slots.find((item) => item.id === slotId);
    if (!slot) {
      throw new Error('Slot not found.');
    }

    const releasedVehicle = slot.currentVehicle;
    slot.status = 'available';
    slot.currentVehicle = null;

    this.history.push({
      id: this.assignmentCounter++,
      timestamp: new Date().toISOString(),
      action: 'slot-released',
      details: `${slot.label} released${releasedVehicle ? ` from vehicle ${releasedVehicle}` : ''}.`
    });

    return slot;
  }
}

export const parkingService = new ParkingService();
