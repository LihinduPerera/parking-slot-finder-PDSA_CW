import { useEffect, useMemo, useState } from 'react';
import DriverPanel from './components/DriverPanel.jsx';
import RecommendationCard from './components/RecommendationCard.jsx';
import MetricsGrid from './components/MetricsGrid.jsx';
import ParkingMap from './components/ParkingMap.jsx';
import SlotTable from './components/SlotTable.jsx';
import ActivityFeed from './components/ActivityFeed.jsx';
import LevelTabs from './components/LevelTabs.jsx';
import VehicleHistoryPanel from './components/VehicleHistoryPanel.jsx';

function escapeCsvValue(value) {
  if (value === null || value === undefined) return '';
  const normalized = Array.isArray(value) ? value.join(' -> ') : String(value);
  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

function toCsv(rows) {
  if (!rows?.length) return 'message\nNo records available';
  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const lines = rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(','));
  return [headers.join(','), ...lines].join('\n');
}

function buildReportRows(reportType, report) {
  if (reportType === 'daily') {
    return [
      {
        reportType: report.type,
        generatedAt: report.generatedAt,
        systemStatus: report.systemStatus,
        totalSlots: report.summary?.totalSlots,
        availableSlots: report.summary?.availableSlots,
        occupiedSlots: report.summary?.occupiedSlots,
        occupancyRate: report.summary?.occupancyRate,
        activeVehicles: report.totals?.activeVehicles,
        processedVehicles: report.totals?.processedVehicles,
        totalVehicleSessions: report.totals?.totalVehicleSessions,
        totalRevenue: report.totals?.totalRevenue,
      },
      ...(report.topOccupiedLevels || []).map((level) => ({
        section: 'topOccupiedLevels',
        level: level.level,
        total: level.total,
        available: level.available,
        occupied: level.occupied,
      })),
      ...(report.recentActivity || []).map((activity) => ({
        section: 'recentActivity',
        eventId: activity.id,
        timestamp: activity.timestamp,
        action: activity.action,
        details: activity.details,
      })),
    ];
  }

  if (reportType === 'occupancy') {
    return [
      {
        reportType: report.type,
        generatedAt: report.generatedAt,
        totalSlots: report.summary?.totalSlots,
        availableSlots: report.summary?.availableSlots,
        occupiedSlots: report.summary?.occupiedSlots,
        occupancyRate: report.summary?.occupancyRate,
      },
      ...(report.byLevel || []).map((level) => ({
        section: 'byLevel',
        level: level.level,
        total: level.total,
        available: level.available,
        occupied: level.occupied,
        occupancyRate: level.occupancyRate,
      })),
      ...(report.byCategory || []).map((category) => ({
        section: 'byCategory',
        category: category.category,
        total: category.total,
        available: category.available,
        occupied: category.occupied,
        occupancyRate: category.occupancyRate,
      })),
      ...(report.byType || []).map((type) => ({
        section: 'byType',
        type: type.type,
        total: type.total,
        available: type.available,
        occupied: type.occupied,
        occupancyRate: type.occupancyRate,
      })),
    ];
  }

  if (reportType === 'activity') {
    return [
      {
        reportType: report.type,
        generatedAt: report.generatedAt,
        totalEvents: report.totals?.totalEvents,
        activeVehicles: report.totals?.activeVehicles,
        processedVehicles: report.totals?.processedVehicles,
        totalVehicleSessions: report.totals?.totalVehicleSessions,
      },
      ...(report.events || []).map((event) => ({
        section: 'events',
        eventId: event.id,
        timestamp: event.timestamp,
        action: event.action,
        details: event.details,
      })),
      ...(report.vehicleHistory || []).map((item) => ({
        section: 'vehicleHistory',
        eventId: item.id,
        vehicleNumber: item.vehicleNumber,
        slotLabel: item.slotLabel,
        category: item.category,
        level: item.level,
        parkedMinutes: item.parkedMinutes,
        totalCost: item.totalCost,
        releasedAt: item.releasedAt,
      })),
    ];
  }

  return [{ message: 'Unsupported report type.' }];
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  const [dashboard, setDashboard] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalMessage, setGlobalMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [vehicleHistory, setVehicleHistory] = useState([]);
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [activePopup, setActivePopup] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [systemLogs, setSystemLogs] = useState([]);

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

  useEffect(() => { fetchDashboard(selectedLevel); }, [selectedLevel]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setActivePopup(null);
        setActiveNav('Dashboard');
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  const handleRecommend = async (payload) => {
    setBusy(true); setGlobalMessage('');
    try {
      const requestPayload = {
        ...payload,
        preferredCategory: payload.preferredCategory === 'any' ? undefined : payload.preferredCategory,
      };
      const response = await fetch(`${API_BASE_URL}/api/recommend`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestPayload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to get recommendation.');
      setRecommendation(data);
      setSelectedLevel(data.level || selectedLevel);
      setGlobalMessage(data.message);
    } catch (error) {
      setRecommendation(null); setGlobalMessage(error.message);
    } finally { setBusy(false); }
  };

  const handleConfirm = async () => {
    if (!recommendation) return;
    setBusy(true); setGlobalMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/confirm`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(recommendation),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to confirm slot.');
      await fetchDashboard(selectedLevel);
      setGlobalMessage(data.message);
      setRecommendation((c) => c && { ...c, confirmed: true });
    } catch (error) { setGlobalMessage(error.message); }
    finally { setBusy(false); }
  };

  const handleSlotStatus = async (slotId, status, vehicleNumber = null) => {
    setBusy(true); setGlobalMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/slots/${slotId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, vehicleNumber }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to update slot.');
      await fetchDashboard(selectedLevel); setGlobalMessage(data.message);
    } catch (error) { setGlobalMessage(error.message); }
    finally { setBusy(false); }
  };

  const handleRelease = async (slotId) => {
    setBusy(true); setGlobalMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/release`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slotId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to release slot.');
      await fetchDashboard(selectedLevel); setGlobalMessage(data.message);
      if (recommendation?.slotId === slotId) setRecommendation(null);
    } catch (error) { setGlobalMessage(error.message); }
    finally { setBusy(false); }
  };

  const handleReset = async () => {
    setBusy(true); setGlobalMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/reset`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to reset system.');
      await fetchDashboard(selectedLevel);
      setRecommendation(null); setVehicleHistory([]); setGlobalMessage(data.message);
    } catch (error) { setGlobalMessage(error.message); }
    finally { setBusy(false); }
  };

  const handleSelectAlternative = (slotId) => {
    if (!recommendation) return;
    const selected = recommendation.alternatives?.find((o) => o.slotId === slotId);
    if (!selected) return;
    setRecommendation((c) => ({
      ...c,
      slotId: selected.slotId, slotLabel: selected.slotLabel, level: selected.level,
      category: selected.category, path: selected.path, distance: selected.distance,
      estimatedTimeMinutes: selected.estimatedTimeMinutes, estimatedCost: selected.estimatedCost,
      estimatedCostBreakdown: selected.estimatedCostBreakdown, confirmed: false,
    }));
  };

  const handleVehicleSearch = async (vehicleNumber) => {
    setBusy(true); setGlobalMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/vehicle/${vehicleNumber}/history`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to load vehicle history.');
      setVehicleHistory(data.history || []);
      setGlobalMessage(`Loaded ${data.history?.length || 0} records for ${vehicleNumber}.`);
    } catch (error) { setGlobalMessage(error.message); }
    finally { setBusy(false); }
  };

  const handleGenerateReport = async (reportType) => {
    setBusy(true); setGlobalMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/${reportType}`);
      if (!response.ok) throw new Error('Unable to generate report.');
      const data = await response.json();
      const rows = buildReportRows(reportType, data);
      const csv = toCsv(rows);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${reportType}-report-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
      window.URL.revokeObjectURL(url);
      setGlobalMessage(`${reportType} CSV report generated successfully.`);
    } catch (error) { setGlobalMessage(error.message); }
    finally { setBusy(false); }
  };

  const handleOpenPopup = async (view) => {
    setActiveNav(view);
    setActivePopup(view);

    if (view === 'Analytics' && !analytics) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/analytics/peak-hours`);
        const data = await response.json();
        setAnalytics(data);
      } catch {
        setGlobalMessage('Unable to load analytics right now.');
      }
    }

    if (view === 'System Logs') {
      try {
        const response = await fetch(`${API_BASE_URL}/api/history`);
        const data = await response.json();
        setSystemLogs(data.history || []);
      } catch {
        setGlobalMessage('Unable to load system logs right now.');
      }
    }
  };

  const handleNavChange = async (view) => {
    if (view === 'Dashboard') {
      setActiveNav('Dashboard');
      setActivePopup(null);
      return;
    }
    await handleOpenPopup(view);
  };

  const analyticsPeak = useMemo(
    () => (analytics?.points || []).reduce((max, point) => Math.max(max, point.occupancyRate), 0),
    [analytics]
  );

  const navItems = [
    { label: 'Dashboard', icon: 'dashboard' },
    { label: 'Map View', icon: 'map' },
    { label: 'Analytics', icon: 'leaderboard' },
    { label: 'System Logs', icon: 'terminal' },
  ];

  const reportItems = [
    { label: 'Daily Report',     type: 'daily',     icon: 'download' },
    { label: 'Occupancy Report', type: 'occupancy', icon: 'download' },
    { label: 'Activity Report',  type: 'activity',  icon: 'terminal' },
  ];

  return (
    <div className="app-root">

      {/* ── TOP BAR ── */}
      <header className="topbar">
        <div className="topbar-left">
          <span className="topbar-brand">Smart Parking Slot Finder</span>
          <div className="topbar-divider" />
          <div className="topbar-meta">
            <span className="topbar-eyebrow">Real-time parking intelligence system</span>
            <div className="topbar-status">
              <span className="topbar-dot" />
              <span className="topbar-online">SYSTEM ONLINE</span>
            </div>
          </div>
        </div>
        <div className="topbar-right">
          <nav className="topbar-nav">
            {['Dashboard', 'Map View', 'Analytics', 'System Logs'].map((item) => (
              <a key={item} href="#"
                onClick={(e) => { e.preventDefault(); handleNavChange(item); }}
                className={`topbar-nav-link${activeNav === item ? ' active' : ''}`}>
                {item}
              </a>
            ))}
          </nav>
          <button className="topbar-icon-btn">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="topbar-icon-btn" onClick={handleReset} disabled={busy}>
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div className="topbar-avatar">
            <span className="material-symbols-outlined">person</span>
          </div>
        </div>
      </header>

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        {/* Core Control */}
        <div className="sidebar-section-label">Core Control</div>
        <nav className="sidebar-nav">
          {navItems.map(({ label, icon }) => (
            <a key={label} href="#"
              onClick={(e) => { e.preventDefault(); handleNavChange(label); }}
              className={`sidebar-nav-link${activeNav === label ? ' active' : ''}`}>
              <span className="material-symbols-outlined">{icon}</span>
              {label}
            </a>
          ))}
        </nav>

        {/* Report Generation */}
        <div className="sidebar-section-label sidebar-section-label--spaced">Report Generation</div>
        <div className="sidebar-reports">
          {reportItems.map(({ label, type, icon }) => (
            <button key={type} type="button"
              className="sidebar-report-btn"
              onClick={() => handleGenerateReport(type)}
              disabled={busy}>
              <span className="sidebar-report-label">{label}</span>
              <span className="material-symbols-outlined sidebar-report-icon">{icon}</span>
            </button>
          ))}
        </div>

        {/* Add Vehicle */}
        <div className="sidebar-add-wrap">
          <button type="button" className="sidebar-add-btn" disabled={busy}>
            <span className="material-symbols-outlined">add_circle</span>
            Add Vehicle
          </button>
        </div>

        {/* Footer links */}
        <div className="sidebar-footer">
          <a href="#" className="sidebar-footer-link">
            <span className="material-symbols-outlined">help</span>Support
          </a>
          <a href="#" className="sidebar-footer-link">
            <span className="material-symbols-outlined">logout</span>Logout
          </a>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="main-content">
        <div className="content-inner">

          {globalMessage && (
            <div className={`toast ${
              globalMessage.toLowerCase().includes('failed') || globalMessage.toLowerCase().includes('unable')
                ? 'toast-error' : 'toast-success'
            }`}>
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
              {dashboard.summary && <MetricsGrid summary={dashboard.summary} />}

              {dashboard.levels && (
                <LevelTabs levels={dashboard.levels} selectedLevel={selectedLevel} onSelectLevel={setSelectedLevel} />
              )}

              <div className="dashboard-grid">
                {/* Left: entry form + recommendation */}
                <div className="dashboard-left">
                  {dashboard.entrances && (
                    <DriverPanel
                      entrances={dashboard.entrances}
                      vehicleTypes={dashboard.vehicleTypes || []}
                      levels={dashboard.levels || []}
                      slotCategories={dashboard.slotCategories || []}
                      onRecommend={handleRecommend}
                      busy={busy}
                    />
                  )}
                  <RecommendationCard
                    recommendation={recommendation}
                    busy={busy}
                    onConfirm={handleConfirm}
                    onSelectAlternative={handleSelectAlternative}
                  />
                </div>

                {/* Right: map + activity + history */}
                <div className="dashboard-right">
                  {dashboard.map && (
                    <ParkingMap map={dashboard.map} slots={dashboard.slots || []} recommendation={recommendation} />
                  )}
                  {dashboard.recentHistory && <ActivityFeed history={dashboard.recentHistory} />}
                  <VehicleHistoryPanel onSearch={handleVehicleSearch} history={vehicleHistory} busy={busy} />
                </div>
              </div>

              {dashboard.slots && (
                <SlotTable
                  slots={dashboard.slots}
                  onSetOccupied={(slotId) => handleSlotStatus(slotId, 'occupied', 'ADMIN-SET')}
                  onSetAvailable={(slotId) => handleSlotStatus(slotId, 'available')}
                  onRelease={handleRelease}
                  busy={busy}
                />
              )}
            </>
          )}
        </div>

        {/* Live sync bar */}
        <div className="live-bar">
          <div className="live-bar-pill">
            <div className="live-bar-item">
              <span className="material-symbols-outlined">speed</span>
              <span>Latency: 24ms</span>
            </div>
            <div className="live-bar-item live-bar-item--accent">
              <span className="material-symbols-outlined">update</span>
              <span>LIVE SYNC</span>
            </div>
          </div>
        </div>

        {activePopup && dashboard && (
          <div
            className="popup-overlay"
            role="dialog"
            aria-modal="true"
            onClick={() => {
              setActivePopup(null);
              setActiveNav('Dashboard');
            }}
          >
            <div className="popup-shell glass-card" onClick={(event) => event.stopPropagation()}>
              <div className="popup-head">
                <div>
                  <p className="eyebrow">Dashboard popup panel</p>
                  <h2>{activePopup}</h2>
                </div>
                <button
                  type="button"
                  className="popup-close"
                  onClick={() => {
                    setActivePopup(null);
                    setActiveNav('Dashboard');
                  }}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {activePopup === 'Map View' && dashboard.map && (
                <div className="popup-content">
                  <div className="map-level-switch">
                    {(dashboard.levels || []).map((levelInfo) => (
                      <button
                        key={levelInfo.level}
                        type="button"
                        className={`map-level-btn${selectedLevel === levelInfo.level ? ' active' : ''}`}
                        onClick={() => setSelectedLevel(levelInfo.level)}
                        disabled={loading}
                      >
                        Level {levelInfo.level}
                      </button>
                    ))}
                  </div>
                  <ParkingMap map={dashboard.map} slots={dashboard.slots || []} recommendation={recommendation} />
                </div>
              )}

              {activePopup === 'Analytics' && (
                <div className="popup-content analytics-popup">
                  <div className="analytics-kpis">
                    <article className="analytics-kpi">
                      <span>Total Slots</span>
                      <strong>{dashboard.summary?.totalSlots ?? 0}</strong>
                    </article>
                    <article className="analytics-kpi">
                      <span>Occupancy</span>
                      <strong>{dashboard.summary?.occupancyRate ?? 0}%</strong>
                    </article>
                    <article className="analytics-kpi">
                      <span>Revenue</span>
                      <strong>LKR {dashboard.summary?.totalRevenue ?? 0}</strong>
                    </article>
                  </div>

                  <div className="peak-hours-chart">
                    <h3>Peak Hour Occupancy</h3>
                    {(analytics?.points || []).map((point) => (
                      <div key={point.hour} className="peak-row">
                        <span>{point.hour}</span>
                        <div className="peak-track">
                          <div
                            className="peak-fill"
                            style={{ width: `${analyticsPeak ? (point.occupancyRate / analyticsPeak) * 100 : 0}%` }}
                          />
                        </div>
                        <strong>{point.occupancyRate}%</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activePopup === 'System Logs' && (
                <div className="popup-content log-popup">
                  {systemLogs.length === 0 ? (
                    <p className="muted">No logs yet.</p>
                  ) : (
                    systemLogs.map((item) => (
                      <article key={item.id} className="log-row">
                        <div>
                          <strong>{item.action}</strong>
                          <p>{item.details}</p>
                        </div>
                        <span>{new Date(item.timestamp).toLocaleString()}</span>
                      </article>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

    </div>
  );
}
