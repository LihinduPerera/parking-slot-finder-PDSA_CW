import { useEffect, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import DriverPanel from './components/DriverPanel.jsx';
import RecommendationCard from './components/RecommendationCard.jsx';
import MetricsGrid from './components/MetricsGrid.jsx';
import ParkingMap from './components/ParkingMap.jsx';
import SlotTable from './components/SlotTable.jsx';
import ActivityFeed from './components/ActivityFeed.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  const [dashboard, setDashboard] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalMessage, setGlobalMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard`);
      const data = await response.json();
      setDashboard(data);
    } catch (error) {
      setGlobalMessage('Failed to connect to backend. Please start the server and refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRecommend = async (payload) => {
    setBusy(true);
    setGlobalMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Unable to get recommendation.');
      }

      setRecommendation(data);
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

      setDashboard(data.dashboard);
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
      setDashboard(data.dashboard);
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
      setDashboard(data.dashboard);
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
      setDashboard(data.dashboard);
      setRecommendation(null);
      setGlobalMessage(data.message);
    } catch (error) {
      setGlobalMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  const recommendedPath = useMemo(() => recommendation?.path || [], [recommendation]);

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

            <section className="hero-grid">
              <DriverPanel
                entrances={dashboard.entrances}
                vehicleTypes={dashboard.vehicleTypes}
                onRecommend={handleRecommend}
                busy={busy}
              />
              <RecommendationCard
                recommendation={recommendation}
                busy={busy}
                onConfirm={handleConfirm}
              />
            </section>

            <section className="workspace-grid">
              <ParkingMap
                map={dashboard.map}
                slots={dashboard.slots}
                recommendedPath={recommendedPath}
                recommendation={recommendation}
              />
              <ActivityFeed history={dashboard.recentHistory} />
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
