import { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import DriverPanel from './components/DriverPanel.jsx';
import RecommendationCard from './components/RecommendationCard.jsx';
import MetricsGrid from './components/MetricsGrid.jsx';
import ParkingMap from './components/ParkingMap.jsx';
import SlotTable from './components/SlotTable.jsx';
import ActivityFeed from './components/ActivityFeed.jsx';
import LevelTabs from './components/LevelTabs.jsx';
import VehicleHistoryPanel from './components/VehicleHistoryPanel.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  const [dashboard, setDashboard] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalMessage, setGlobalMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [vehicleHistory, setVehicleHistory] = useState([]);

  const fetchDashboard = async (level = selectedLevel) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard?level=${level}`);
      const data = await response.json();
      setDashboard(data);
      setSelectedLevel(data.selectedLevel || level);
    } catch (error) {
      setGlobalMessage('Failed to connect to backend. Please start the server and refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(selectedLevel);
  }, [selectedLevel]);

  const handleRecommend = async (payload) => {
    setBusy(true);
    setGlobalMessage('');

    try {
      const requestPayload = {
        ...payload,
        preferredCategory: payload.preferredCategory === 'any' ? undefined : payload.preferredCategory
      };

      const response = await fetch(`${API_BASE_URL}/api/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Unable to get recommendation.');
      }

      setRecommendation(data);
      setSelectedLevel(data.level || selectedLevel);
      setGlobalMessage(data.message);
    } catch (error) {
      setRecommendation(null);
      setGlobalMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleConfirm = async () => {
    if (!recommendation) {
      return;
    }

    setBusy(true);
    setGlobalMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recommendation)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Unable to confirm slot.');
      }

      await fetchDashboard(selectedLevel);
      setGlobalMessage(data.message);
      setRecommendation((current) => current && { ...current, confirmed: true });
    } catch (error) {
      setGlobalMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleSlotStatus = async (slotId, status, vehicleNumber = null) => {
    setBusy(true);
    setGlobalMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/slots/${slotId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, vehicleNumber })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Unable to update slot.');
      }
      await fetchDashboard(selectedLevel);
      setGlobalMessage(data.message);
    } catch (error) {
      setGlobalMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleRelease = async (slotId) => {
    setBusy(true);
    setGlobalMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Unable to release slot.');
      }
      await fetchDashboard(selectedLevel);
      setGlobalMessage(data.message);
      if (recommendation?.slotId === slotId) {
        setRecommendation(null);
      }
    } catch (error) {
      setGlobalMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    setBusy(true);
    setGlobalMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/reset`, {
        method: 'POST'
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Unable to reset system.');
      }
      await fetchDashboard(selectedLevel);
      setRecommendation(null);
      setVehicleHistory([]);
      setGlobalMessage(data.message);
    } catch (error) {
      setGlobalMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleSelectAlternative = (slotId) => {
    if (!recommendation) {
      return;
    }

    const selected = recommendation.alternatives?.find((option) => option.slotId === slotId);
    if (!selected) {
      return;
    }

    setRecommendation((current) => ({
      ...current,
      slotId: selected.slotId,
      slotLabel: selected.slotLabel,
      level: selected.level,
      category: selected.category,
      path: selected.path,
      distance: selected.distance,
      estimatedTimeMinutes: selected.estimatedTimeMinutes,
      estimatedCost: selected.estimatedCost,
      estimatedCostBreakdown: selected.estimatedCostBreakdown,
      confirmed: false
    }));
  };

  const handleVehicleSearch = async (vehicleNumber) => {
    setBusy(true);
    setGlobalMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/vehicle/${vehicleNumber}/history`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Unable to load vehicle history.');
      }
      setVehicleHistory(data.history || []);
      setGlobalMessage(`Loaded ${data.history?.length || 0} records for ${vehicleNumber}.`);
    } catch (error) {
      setGlobalMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <main className="page-container">
        <Header onReset={handleReset} busy={busy} />

        {globalMessage && (
          <div className={`toast ${globalMessage.toLowerCase().includes('failed') || globalMessage.toLowerCase().includes('unable') ? 'toast-error' : 'toast-success'}`}>
            {globalMessage}
          </div>
        )}

        {loading || !dashboard ? (
          <section className="loading-panel glass-card">
            <div className="spinner" />
            <p>Loading parking intelligence dashboard...</p>
          </section>
        ) : (
          <>
            <MetricsGrid summary={dashboard.summary} />

            <LevelTabs
              levels={dashboard.levels}
              selectedLevel={selectedLevel}
              onSelectLevel={setSelectedLevel}
            />

            <section className="hero-grid">
              <DriverPanel
                entrances={dashboard.entrances}
                vehicleTypes={dashboard.vehicleTypes}
                levels={dashboard.levels}
                slotCategories={dashboard.slotCategories}
                onRecommend={handleRecommend}
                busy={busy}
              />
              <RecommendationCard
                recommendation={recommendation}
                busy={busy}
                onConfirm={handleConfirm}
                onSelectAlternative={handleSelectAlternative}
              />
            </section>

            <section className="workspace-grid">
              <ParkingMap
                map={dashboard.map}
                slots={dashboard.slots}
                recommendation={recommendation}
              />
              <ActivityFeed history={dashboard.recentHistory} />
            </section>

            <section className="workspace-grid">
              <VehicleHistoryPanel
                onSearch={handleVehicleSearch}
                history={vehicleHistory}
                busy={busy}
              />
            </section>

            <SlotTable
              slots={dashboard.slots}
              onSetOccupied={(slotId) => handleSlotStatus(slotId, 'occupied', 'ADMIN-SET')}
              onSetAvailable={(slotId) => handleSlotStatus(slotId, 'available')}
              onRelease={handleRelease}
              busy={busy}
            />
          </>
        )}
      </main>
    </div>
  );
}
