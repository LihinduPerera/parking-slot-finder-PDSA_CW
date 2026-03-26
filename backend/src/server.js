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

app.get('/api/dashboard', (_req, res) => {
  res.json(parkingService.getDashboard());
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

app.use((_req, res) => {
  res.status(404).json({ message: 'Endpoint not found.' });
});

app.listen(PORT, () => {
  console.log(`Smart Parking backend running on http://localhost:${PORT}`);
});
