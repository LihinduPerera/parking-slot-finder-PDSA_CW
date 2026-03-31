import cors from 'cors';
import express from 'express';
import { parkingService } from './services/parkingService.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Smart Parking backend is running.' });
});

app.get('/api/dashboard', (req, res) => {
  const { level } = req.query;
  res.json(parkingService.getDashboard({ level }));
});

app.get('/api/history', (_req, res) => {
  res.json({ history: parkingService.getHistory() });
});

app.post('/api/recommend', (req, res) => {
  try {
    const recommendation = parkingService.recommendSlot(req.body);
    if (!recommendation) {
      return res.status(404).json({ message: 'No available slots found for the selected vehicle type.' });
    }
    return res.json(recommendation);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

app.post('/api/parking-cost', (req, res) => {
  try {
    const { slotId, estimatedDurationMinutes } = req.body;
    const result = parkingService.calculateParkingCost(slotId, estimatedDurationMinutes);
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

app.get('/api/map/levels', (_req, res) => {
  res.json({ levels: parkingService.getLevelsOverview() });
});

app.get('/api/analytics/peak-hours', (_req, res) => {
  res.json(parkingService.getPeakHoursAnalytics());
});

app.get('/api/vehicle/:vehicleNumber/history', (req, res) => {
  const history = parkingService.getVehicleHistory(req.params.vehicleNumber);
  res.json({ history });
});

app.post('/api/confirm', (req, res) => {
  try {
    const slot = parkingService.confirmAssignment(req.body);
    return res.json({ message: 'Parking slot confirmed successfully.', slot, dashboard: parkingService.getDashboard() });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

app.patch('/api/slots/:slotId', (req, res) => {
  try {
    const { slotId } = req.params;
    const { status, vehicleNumber } = req.body;
    const slot = parkingService.updateSlotStatus(slotId, status, vehicleNumber);
    return res.json({ message: 'Slot updated successfully.', slot, dashboard: parkingService.getDashboard() });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

app.post('/api/release', (req, res) => {
  try {
    const { slotId } = req.body;
    const slot = parkingService.releaseSlot(slotId);
    return res.json({ message: 'Slot released successfully.', slot, dashboard: parkingService.getDashboard() });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

app.post('/api/reset', (_req, res) => {
  parkingService.reset();
  res.json({ message: 'System reset to demo state.', dashboard: parkingService.getDashboard() });
});

app.get('/api/reports/:reportType', (req, res) => {
  try {
    const { reportType } = req.params;
    const report = parkingService.generateReport(reportType);
    res.json(report);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

app.use((_req, res) => {
  res.status(404).json({ message: 'Endpoint not found.' });
});

app.listen(PORT, () => {
  console.log(`Smart Parking backend running on http://localhost:${PORT}`);
});
